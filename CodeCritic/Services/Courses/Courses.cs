using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using CC.Net.Config;
using Cc.Net.Extensions;
using Microsoft.Extensions.Logging;

namespace CC.Net.Services.Courses
{
    public class Courses
    {
        private readonly ConfigParser _configParser;
        private ILogger<Courses> _logger;
        private List<CourseConfigDto> _courses { get; set; }
        
        public Courses(ILogger<Courses> logger, AppOptions appOptions)
        {
            _configParser = new ConfigParser(appOptions);
            _logger = logger;
            _courses = _configParser.ToDto(_configParser.ParseCourses());
        }

        public List<CourseConfigDto> All => _courses
            .ToList();

        public List<CourseYearDto> AllYears => _courses
            .SelectMany(i => i.Courses)
            .ToList();
        

        public List<CourseConfigDto> ForUser(string userId, bool isRoot)
        {
            return _courses
                .Where(i => CanAccessCourse(i, userId, isRoot))
                .ToList();
        }
        
        public List<CourseConfigDto> ForUser(AppUser user)
        {
            return ForUser(user.Id, user.IsRoot);
        }

        
        public List<CourseYearDto> YearsForUser(AppUser user)
        {
            return YearsForUser(user.Id, user.IsRoot);
        }
        public List<CourseYearDto> YearsForUser(string userId, bool isRoot)
        {
            return _courses
                .SelectMany(i => i.Courses)
                .Where(i => CanAccessYear(i, userId, isRoot))
                .ToList();
        }

        public ProblemDto GetProblem(string course, string year, string problemId, AppUser user)
        {
            return GetProblem(course, year, problemId, user.Id, user.IsRoot);
        }
        
        public List<ProblemDto> GetProblems(string course, string year, AppUser user)
        {
            return GetProblems(course, year, user.Id, user.IsRoot);
        }
        
        /// <summary>
        /// return ProblemDto if all is good, null if permission denied, exception if non existing
        /// </summary>
        public ProblemDto GetProblem(string course, string year, string problemId, string userId, bool isRoot)
        {
            var problems = GetProblems(course, year, userId, isRoot);
            return problems.SingleOrDefault(i => i.Problem == problemId);
        }

        /// <summary>
        /// return ProblemDto if all is good, null if permission denied, exception if non existing
        /// </summary>
        public List<ProblemDto> GetProblems(string course, string year, string userId, bool isRoot)
        {
            try
            {
                return YearsForUser(userId, isRoot)
                    .Single(i => i.Year == year && i.CourseConfigDto().Name == course)
                    .Problems;
            }
            catch (Exception e1)
            {
                try
                {
                    var exists = YearsForUser(userId, true)
                        .Single(i => i.Year == year && i.CourseConfigDto().Name == course)
                        .Problems;
                    
                    _logger.LogWarning("Access denied {Course} {Year} ({User}, {isRoot})",
                        course, year, userId, isRoot ? "root" : "not root");
                    
                    return null;
                }
                catch (Exception e2)
                {
                    _logger.LogError(e2, "Could not find problem {Course} {Year}",
                        course, year);
                    throw;
                }
            }
        }


        public void Reload()
        {
            _courses = _configParser.ToDto(_configParser.ParseCourses());
        }

        private static bool CanAccessYear(CourseYearDto courseYear, string userId, bool isRoot)
        {
            var course = courseYear.CourseConfigDto();
            if (isRoot || course.Access == CourseAccess.Public)
            {
                return true;
            }
            
            if (courseYear.AllUsers().Contains(userId))
            {
                return true;
            }

            return false;
        }
        
        private static bool CanAccessCourse(CourseConfigDto course, string userId, bool isRoot)
        {
            if (isRoot || course.Access == CourseAccess.Public)
            {
                return true;
            }

            if (course.Access == CourseAccess.Private)
            {
                if (course.Courses.Any(i => CanAccessYear(i, userId, isRoot)))
                {
                    return true;
                }
            }

            return false;
        }
    }
}