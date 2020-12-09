using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Attributes;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace CC.Net.Controllers
{
    
    
    [ApiController]
    [Route("dev")]
    [Authorize]
    
    public class DeveloperController
    {
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly DbService _dbService;
        private readonly ProblemDescriptionService _problemDescriptionService;
        private readonly CompareService _compareService;
        private readonly ILogger<DeveloperController> _logger;

        public DeveloperController(
            CourseService courseService, LanguageService languageService, DbService dbService,
            ProblemDescriptionService problemDescriptionService,
            CompareService compareService, IHttpContextAccessor httpContextAccessor,
            ILogger<DeveloperController> logger
            )
        {
            _courseService = courseService;
            _languageService = languageService;
            _dbService = dbService;
            _problemDescriptionService = problemDescriptionService;
            _compareService = compareService;
            _logger = logger;
        }

        [HttpGet("submission-status")]
        [RequireRole(AppUserRoles.Root)]
        public async Task<object> FixSubmissionStatus()
        {
            foreach(var item in _dbService.Data.AsQueryable())
            {
                _logger.LogWarning(item.ToString());
                try
                {
                    var course = _courseService[item.CourseName];
                    var courseYearConfig = course[item.CourseYear];
                    var problem = courseYearConfig[item.Problem];

                    var dt = item.Id.CreationTime;
                    item.SubmissionStatus = 
                        dt <= problem.Avail
                            ? SubmissionStatus.Intime
                            : dt <= problem.Deadline
                                ? SubmissionStatus.Late
                                : SubmissionStatus.None;

                    await ResultsUtils.SaveItemAsync(_dbService, item);
                    
                }catch(Exception ex) {
                    _logger.LogError(ex, "Error");
                }
            }

            return "ok";
        }

        [HttpGet("fix-scores")]
        [RequireRole(AppUserRoles.Root)]
        public async Task<object> FixScores()
        {
            var result = new List<string>();
            foreach(var item in _dbService.Data.AsQueryable())
            {
                try
                {
                    var score = ResultsUtils.ComputeScore(item.Result.Scores);
                    result.Add($"Ok: {item.ObjectId}, {score}/{item.Result.Score}");
                    item.Result.Score = score;
                    await ResultsUtils.SaveItemAsync(_dbService, item);
                }
                catch(Exception ex)
                {
                    result.Add($"Error: {item.ObjectId}, {ex.ToString()}");
                }
            }
            return result;
        }

        [HttpGet("fix-notifications")]
        [RequireRole(AppUserRoles.Root)]
        public async Task<object> FixNotifications()
        {
            var notifications = await _dbService.Events
                .AsQueryable()
                .ToListAsync();

            notifications = notifications
                .Where(i => i.Reciever == "jan.hybs")
                .ToList();

            var total = 0;
            notifications
                .ForEach(i =>
                {
                    var course = _dbService.Data.Find(j => j.Id == i.ResultId).ToList().FirstOrDefault()?.CourseName;
                    if (course?.ToUpper() != "ALD")
                    {
                        _dbService.Events.DeleteOne(j => j.Id == i.Id);
                        total++;
                    }
                });

            return $"Deleted {total} notifications";
        }
    }
}