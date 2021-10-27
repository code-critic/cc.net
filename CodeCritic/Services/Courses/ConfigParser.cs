using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Config;
using Cc.Net.Exceptions;
using Cc.Net.Extensions;
using CC.Net.Utils;

namespace CC.Net.Services.Courses
{
    public class ConfigParser
    {
        private readonly AppOptions _appOptions;

        public ConfigParser(AppOptions appOptions)
        {
            _appOptions = appOptions;
        }

        public List<Course> ParseCourses()
        {
            // 1) parse <course>/config.yaml
            var courses = new List<Course>();
            var root = _appOptions.CourseDir;
            foreach (var dir in Directory.GetDirectories(root))
            {
                var course = ParseCourse(dir);
                if (course == null) continue;

                courses.Add(course);
            }

            // 2) parse <course>/<year>/config.yaml
            //    parse <course>/<year>/settings.yaml
            //    parse <course>/<year>/groups.yaml
            foreach (var course in courses)
            {
                var years = new List<CourseYearConfig>();
                foreach (var yearDir in Directory.GetDirectories(course.CourseDir))
                {
                    var year = ParseCourseYear(course, yearDir);
                    if (year != null)
                    {
                        years.Add(year);
                    }
                }

                course.CourseYears = years;
            }

            return courses;
        }

        public List<CourseConfigDto> ToDto(List<Course> courses)
        {
            // 3) map to dto
            var dtos = new List<CourseConfigDto>();
            foreach (var course in courses)
            {
                var dto = new CourseConfigDto
                {
                    Name = course.CourseConfig.Name,
                    Desc = course.CourseConfig.Desc,
                    Disabled = course.CourseConfig.Disabled,
                    Access =  course.CourseConfig.Access.ParseOrDefault(CourseAccess.Private),
                    Courses = new List<CourseYearDto>(),
                    Errors = course.Errors,
                    CourseDir = course.CourseDir,
                };
                course.CourseYears.ForEach(i =>
                {
                    var courseDto = new CourseYearDto(dto)
                    {
                        Year = i.Year,
                        Teachers = i.SettingsConfig.Teachers,
                    };
                    courseDto.Problems = i.Problems
                        .Select(j => new ProblemDto(courseDto)
                        {
                            Config = j,
                        }).ToList();

                    dto.Courses.Add(courseDto);
                });
                dtos.Add(dto);
            }

            return dtos;
        }
        
        private CourseYearConfig ParseCourseYear(Course course, string yearDir)
        {
            try
            {
                var yearConfig = Path.Combine(yearDir, "config.yaml");
                var settingsConfig = Path.Combine(yearDir, "settings.yaml");
                var groupsConfig = Path.Combine(yearDir, "groups.yaml");
                var year = new CourseYearConfig {Year = Path.GetFileName(yearDir)};

                // 1) required config.yaml
                if (!File.Exists(yearConfig))
                {
                    return null;
                }
                (year.Problems, year.Yaml) = YamlRead.ReadFromFile<List<CourseProblem>>(yearConfig);

                // 2) optional settings.yaml
                if (File.Exists(settingsConfig))
                {
                    var settConf = YamlRead.ReadFromFile<SettingsConfig>(settingsConfig);
                    year.SettingsConfig = settConf.data;
                }
                else
                {
                    year.SettingsConfig = new SettingsConfig();
                }

                // 3) optional groups.yaml
                if (File.Exists(groupsConfig))
                {
                    var groupConf = YamlRead.ReadFromFile<CourseGroup>(groupsConfig);
                    year.CourseGroup = groupConf.data;
                }
                else
                {
                    year.CourseGroup = new CourseGroup();
                }

                return year;
            }
            catch (DetailedException e)
            {
                var msg = $"Error while parsing file {e.File}: ";
                course.Errors.Add(msg);
                course.Errors.AddRange(e.Messages);
                Console.Error.WriteLine(msg);
                return null;
            }
        }

        private Course ParseCourse(string dir)
        {
            var config = Path.Combine(dir, "config.yaml");
            if (!File.Exists(config))
            {
                return null;
            }

            var course = new Course {CourseDir = dir};
            try
            {
                (course.CourseConfig, course.Yaml) = YamlRead.ReadFromFile<CourseConfig>(config);
                return course;
            }
            catch (Exception e)
            {
                Console.Error.WriteLine($"Failed to parse config.yaml {e}");
                return null;
            }
        }
    }
}