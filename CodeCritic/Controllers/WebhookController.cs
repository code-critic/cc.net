using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using CC.Net.Collections;
using CC.Net.Config;
using CC.Net.Db;
using CC.Net.Dto;
using CC.Net.Entities;
using CC.Net.Extensions;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("webhook")]
    public class WebhookController
    {
        private readonly CourseService _courseService;

        public WebhookController(CourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpPost("update")]
        [Consumes("application/x-www-form-urlencoded")]
        public object Update()
        {
            foreach (var dir in _courseService.Courses.Select(i => i.CourseDir))
            {
                var cmd = $"bash -c \"cd {dir} && git fetch --all && git reset --hard origin/master\"";
                var res = ProcessUtils.Popen(cmd, 30);
            }
            return _courseService.Courses.Select(i => i.CourseConfig.Name);
        }
    }
}