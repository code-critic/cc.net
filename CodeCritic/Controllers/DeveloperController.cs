using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Attributes;
using CC.Net.Collections;
using CC.Net.Config;
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
    [Route("api")]
    [Authorize]
    
    public class DeveloperController: ControllerBase
    {
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly DbService _dbService;
        private readonly ProblemDescriptionService _problemDescriptionService;
        private readonly CompareService _compareService;
        private readonly ILogger<DeveloperController> _logger;
        private readonly UserService _userService;
        private readonly AppOptions _appOptions;

        public DeveloperController(
            CourseService courseService, LanguageService languageService, DbService dbService,
            ProblemDescriptionService problemDescriptionService,
            CompareService compareService, IHttpContextAccessor httpContextAccessor,
            ILogger<DeveloperController> logger, UserService userService, AppOptions appOptions)
        {
            _courseService = courseService;
            _languageService = languageService;
            _dbService = dbService;
            _problemDescriptionService = problemDescriptionService;
            _compareService = compareService;
            _logger = logger;
            _userService = userService;
            _appOptions = appOptions;
        }

        [HttpGet("rename/{id}")]
        [RequireRole(AppUserRoles.Root)]
        public async Task<object> ChangeUser(string id)
        {
            var user = _userService.CurrentUser;
            if (_appOptions.Admins.Contains(user.Id) || user.IsRoot)
            {
                var newUser = user.Copy();
                newUser.Eppn = $"{id}@tul.cz";
                newUser.Elevate();
                await _userService.SignInAsync(HttpContext, newUser);

                return new
                {
                    code = 200,
                    status = "ok",
                    message = "user changed",
                };
            }

            return new
            {
                code = 401,
                status = "error",
                message = "access denied",
            };
        }
    }
}