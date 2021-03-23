using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using CC.Net.Attributes;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Extensions;
using Cc.Net.Services;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using static CC.Net.Collections.CcData;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public partial class StudentController : ControllerBase
    {

        private readonly ILogger<StudentController> _logger;
        private readonly DbService _dbService;
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly UserService _userService;
        private readonly UtilService _utilService;

        public StudentController(ILogger<StudentController> logger,
            DbService dbService, CourseService courseService, LanguageService languageService,
            UserService userService, UtilService utilService, ViewResultService viewResultService)
        {
            _logger = logger;
            _dbService = dbService;
            _courseService = courseService;
            _languageService = languageService;
            _userService = userService;
            _utilService = utilService;
            _viewResultService = viewResultService;
        }
    }
}
