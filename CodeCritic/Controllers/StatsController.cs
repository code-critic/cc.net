using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Cc.Net.Dto;
using Cc.Net.Extensions;
using CC.Net.Attributes;
using CC.Net.Collections;
using CC.Net.Config;
using CC.Net.Db;
using CC.Net.Dto;
using CC.Net.Entities;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using Cc.Net.Utils;
using CC.Net.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace Cc.Net.Controllers
{
    [ApiController]
    [Route("api/stats")]
    [Authorize]
    public class StatsController : ControllerBase                                     
    {

        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly DbService _dbService;
        private readonly ProblemDescriptionService _problemDescriptionService;
        private readonly AppOptions _appOptions;
        private readonly CompareService _compareService;
        private readonly UserService _userService;
        private readonly UtilService _utilService;
        private readonly ILogger<StatsController> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public StatsController(
            CourseService courseService, LanguageService languageService, DbService dbService,
            ProblemDescriptionService problemDescriptionService, AppOptions appOptions,
            CompareService compareService, IHttpContextAccessor httpContextAccessor, UserService userService,
            UtilService utilService, ILogger<StatsController> logger)
        {
            _courseService = courseService;
            _languageService = languageService;
            _dbService = dbService;
            _problemDescriptionService = problemDescriptionService;
            _appOptions = appOptions;
            _compareService = compareService;
            _userService = userService;
            _utilService = utilService;
            _logger = logger;
        }

        [HttpGet("all-stats")]
        [UseCache(timeToLiveSeconds: 10*60)]
        public IActionResult AllStats()
        {
            var pipeline = new List<BsonDocument>();
            pipeline.Add(BsonDocument.Parse(@"
                { $match: {action: ""solve"", courseYear: ""2020""} }
            "));

            pipeline.Add(BsonDocument.Parse(@"
                { $group: {
                        _id: {
                            courseName: ""$courseName"",
                            language: ""$language"",
                        },
                        duration: { $push: ""$result.duration""},
                        status: { $push: ""$result.status""},
                    }
                }
            "));

            var data = _dbService.Data
                .Aggregate<StatsData>(pipeline.ToArray())
                .ToList();

            var languages = data.GroupBy(i => i.Language).Where(i => i.Sum(j => j.TotalCount) > 50).Select(i => i.Key).Distinct().OrderBy(i => i).ToList();
            var courses = data.GroupBy(i => i.CourseName).Where(i => i.Sum(j => j.TotalCount) > 50).Select(i => i.Key).Distinct().OrderBy(i => i).ToList();

            var combo = languages.SelectMany(i => courses, (language, course) => new { language, course })
                .OrderBy(i => i.course)
                    .ThenBy(i => i.language)
                .ToList();

            var countChart = languages.Select(i =>
            {
                var counts = new List<object>();
                foreach (var l in courses)
                {
                    var items = data.Where(j => j.CourseName == l && j.Language == i);
                    var perLanguage = items.Select(j => j.TotalCount).Sum();
                    counts.Add(perLanguage);
                }

                return new { name = i, data = counts };
            }).ToList();
            
            var durationChart = languages.Select(i =>
            {
                var counts = new List<object>();
                foreach (var l in courses)
                {
                    var items = data.Where(j => j.CourseName == l && j.Language == i);
                    var perLanguage = items.Select(j => j.TotalDuration).Sum();
                    counts.Add(Math.Ceiling(perLanguage / 60));
                }

                return new { name = i, data = counts };
            }).ToList();

            var histoChart = data.SelectMany(i => i.Duration);
            var max_97 = Percentile(histoChart.ToArray(), 0.98);

            var content = new List<object> {
                new {
                    title = new  { text = "Number of submission per Course" },
                    chart = new { type = "bar" },
                    series = countChart,
                    xAxis = new { categories = courses },
                    yAxis = new { title = new { text = (string) null } },
                    tooltip = new {
                        headerFormat = "<b>{point.x}</b><br/>",
                        pointFormat = "{series.name}: {point.y} submissions<br/>Total: {point.stackTotal} submissions"
                    },
                    plotOptions = new {
                        bar = new {
                            stacking = "normal",
                        }
                    },
                },
                new {
                    title = new  { text = "Total runtime in minutes per Course" },
                    series = durationChart,
                    chart = new { type = "bar" },
                    xAxis = new { categories = courses },
                    yAxis = new { title = new { text = (string) null } },
                    tooltip = new {
                        headerFormat = "<b>{point.x}</b><br/>",
                        pointFormat = "{series.name}: {point.y} min<br/>Total: {point.stackTotal} min"
                    },
                    plotOptions = new {
                        bar = new {
                            stacking = "normal",
                        }
                    },
                },
                new {
                    histogram = true,
                    title = new { text = "Histogram of runtime" },
                    series = new List<object> {
                        new {
                            name = "Histogram",
                            type = "histogram",
                            xAxis = 1,
                            yAxis = 1,
                            baseSeries = "s1",
                            zIndex = -1,
                            binsNumber = 33, // "square-root", "sturges", "rice", number, function
                        },
                        new {
                            visible = false,
                            name = "Data",
                            type = "scatter",
                            data = histoChart.Where(i => i <= max_97).OrderBy(i => i),
                            id = "s1",
                            marker = new {
                                radius = 1.5
                            }
                        }
                    }
                }
            };

            return Ok(content);
        }

        private double Percentile(double[] sequence, double excelPercentile)
        {
            Array.Sort(sequence);
            int N = sequence.Length;
            double n = (N - 1) * excelPercentile + 1;
            // Another method: double n = (N + 1) * excelPercentile;
            if (n == 1d) return sequence[0];
            else if (n == N) return sequence[N - 1];
            else
            {
                int k = (int)n;
                double d = n - k;
                return sequence[k - 1] + d * (sequence[k] - sequence[k - 1]);
            }
        }
    }

    public class StatsData
    {
        [BsonElement("_id")]
        public StatsDataId Id { get; set; }

        public string CourseName => Id.CourseName;

        public string Language => Id.Language;

        public double TotalDuration => Duration.Sum();

        public int TotalCount => Duration.Count();


        [BsonElement("duration")]
        public List<double> Duration { get; set; } = new List<double>();

        [BsonElement("status")]
        public List<ProcessStatusCodes> Status { get; set; } = new List<ProcessStatusCodes>();
    }

    public class StatsDataId
    {
        [BsonElement("courseName")]
        public string CourseName { get; set; }
        
        [BsonElement("language")]
        public string Language { get; set; }

    }
}