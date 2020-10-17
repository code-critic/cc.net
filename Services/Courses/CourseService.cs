using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Config;
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
                var config = Path.Combine(dir, "config.yaml");
                if (File.Exists(config))
                {
                    var course = new Course
                    {
                        CourseConfig = YamlRead.Read<CourseConfig>(config),
                        CourseYears = ParseCourse(dir),
                        CourseDir = dir
                    };

                    course.CourseYears.ForEach(i => i.SetCourse(course));
                    if(!course.CourseConfig.Disabled)
                    {
                        result.Add(course);
                    }
                    else
                    {
                        _logger.LogInformation("Ignoring course {course}", course.Name);
                    }
                }
            }
            return result;
        }

        private List<CourseYearConfig> ParseCourse(string dir)
        {
            var result = new List<CourseYearConfig>();
            foreach (var yearDir in Directory.GetDirectories(dir))
            {
                var yearConfig = Path.Combine(yearDir, "config.yaml");
                if (File.Exists(yearConfig))
                {
                    result.Add(
                        new CourseYearConfig
                        {
                            Year = Path.GetFileName(yearDir),
                            Problems = YamlRead.Read<List<CourseProblem>>(yearConfig),
                        }
                    );
                }
            }
            return result;
        }

        public Course this[string key]
        {
            get => Courses.FirstOrDefault(i => i.Name.ToLower() == key.ToLower());
        }
    }
}