using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Attributes;
using CC.Net.Collections;
using CC.Net.Config;
using CC.Net.Db;
using Cc.Net.Services;
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
    [Route("admin")]
    [Authorize]
    public class AdminController: ControllerBase
    {
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly ProblemDescriptionService _problemDescriptionService;
        private readonly CompareService _compareService;
        private readonly ILogger<AdminController> _logger;
        private readonly UserService _userService;
        private readonly AppOptions _appOptions;
        private readonly ServerStatus _serverStatus;

        public AdminController(
            CourseService courseService, LanguageService languageService,
            ProblemDescriptionService problemDescriptionService,
            CompareService compareService, IHttpContextAccessor httpContextAccessor,
            ILogger<AdminController> logger, UserService userService, AppOptions appOptions, ServerStatus serverStatus)
        {
            _courseService = courseService;
            _languageService = languageService;
            _problemDescriptionService = problemDescriptionService;
            _compareService = compareService;
            _logger = logger;
            _userService = userService;
            _appOptions = appOptions;
            _serverStatus = serverStatus;
        }

        [HttpPost("change-server-state")]
        [RequireRole(AppUserRoles.Root)]
        public async Task<AdminResponse> ChangeServerState(ChangeServerStateRequest request)
        {
            if (request.Password == _appOptions.SysAdminPasswd)
            {
                _serverStatus.Status = request.NewState;
                _serverStatus.Message = request.Message;
                
                return new AdminResponse
                {
                    Ok = true,
                    Message = "changed"
                };
            }
            
            throw new UnauthorizedAccessException();
        }
    }

    public class ChangeServerStateRequest
    {
        public string Password { get; set; }
        public string NewState { get; set; }
        public string Message { get; set; }
    }
    public class AdminResponse
    {
        public bool Ok { get; set; }
        public string Message { get; set; }
    }
}