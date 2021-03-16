using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Config;
using cc.net.Exceptions;
using CC.Net.Utils;
using Microsoft.Extensions.Logging;

namespace CC.Net.Services.Courses
{
    public class CourseService
    {
        private readonly AppOptions _appOptions;
        public readonly List<Course> Courses;
        public readonly ILogger<CourseService> _logger;

        public CourseService(AppOptions appOptions, ILogger<CourseService> logger)
        {
            _appOptions = appOptions;
            _logger = logger;
            Courses = Parse();
        }

        public IEnumerable<Course> GetAllowedCoursesForUser(AppUser user)
        {
            foreach (var course in Courses)
            {
                var access = course.CourseConfig.Access;
                if (access == "everyone" || access == "public" || user.IsRoot)
                {
                    yield return course;
                }

                else if (access == "private")
                {
                    var allowedIds = course.CourseConfig.Students.Select(i => i.id)
                        .Concat(course.CourseConfig.Teachers.Select(i => i.id))
                        .ToList();

                    if (allowedIds.Contains(user.Id))
                    {
                        yield return course;
                    }
                }
            }
        }

        public Course GetCourseForUser(AppUser user, string courseName)
        {
            var courses = GetAllowedCoursesForUser(user);
            var course = courses.First(i => i.CourseConfig.Name.ToLower() == courseName.ToLower());
            return course;
        }

        private List<Course> Parse()
        {
            var result = new List<Course>();
            foreach (var dir in Directory.GetDirectories(_appOptions.CourseDir))
            {
                var course = ParseCourse(dir);
                if (course != null)
                {
                    try
                    {
                        result.Add(course);
                    }
                    catch (Exception e)
                    {
                        _logger.LogError(e, "Course {Dir} parse failed", dir);
                    }
                }
            }

            // propagate references
            result.ForEach(UpdateRefs);

            return result;
        }

        private Course ParseCourse(string dir)
        {
            var config = Path.Combine(dir, "config.yaml");
            if (!File.Exists(config))
            {
                return null;
            }

            var course = new Course { CourseDir = dir };
            (course.CourseConfig, course.Yaml) = YamlRead.ReadFromFile<CourseConfig>(config);

            try
            {
                course.CourseYears = ParseCourseYears(dir);
            }
            catch (DetailedException e)
            {
                var msg = $"Error while parsing course {course.CourseConfig.Name} year config {dir}: ";
                course.Errors.AddRange(e.Messages);
                _logger.LogError(msg);
            }
            catch (Exception e)
            {
                var msg = $"Error while parsing course {course.CourseConfig.Name} year config {dir}: ";
                course.Errors.AddRange(new[] {msg, e.Message});
                _logger.LogError(msg);
            }
            finally
            {
                course.CourseYears ??= new List<CourseYearConfig>();
            }

            if (!course.CourseConfig.Disabled)
            {
                return course;
            }

            _logger.LogInformation("Ignoring course {Course}", course.Name);

            return null;
        }

        private void UpdateRefs(Course course)
        {
            course.CourseYears.ForEach(i => i.UpdateRefs(course));
        }

        private SettingsConfig ParseSettingConfigOrDefault(string settingsConfig)
        {
            // parse settings.yaml
            if (!File.Exists(settingsConfig))
            {
                return null;
            }

            var (data, _) = YamlRead.ReadFromFile<SettingsConfig>(settingsConfig);
            return data;

        }

        private List<CourseYearConfig> ParseCourseYears(string dir)
        {
            var result = new List<CourseYearConfig>();
            foreach (var yearDir in Directory.GetDirectories(dir))
            {
                ParseCourseYear(yearDir, result);
            }
            return result;
        }

        private void ParseCourseYear(string yearDir, List<CourseYearConfig> result)
        {
            var yearConfig = Path.Combine(yearDir, "config.yaml");
            var settingsConfig = Path.Combine(yearDir, "settings.yaml");
            if (File.Exists(yearConfig))
            {
                // parse config.yaml
                var cfg = new CourseYearConfig { Year = Path.GetFileName(yearDir) };
                
                (cfg.Problems, cfg.Yaml) = YamlRead.ReadFromFile<List<CourseProblem>>(yearConfig);
                cfg.SettingsConfig = ParseSettingConfigOrDefault(settingsConfig);
                
                result.Add(cfg);
            }
        }

        public Course this[string key]
        {
            get => Courses.FirstOrDefault(i => i.Name.ToLower() == key.ToLower());
        }
    }
}