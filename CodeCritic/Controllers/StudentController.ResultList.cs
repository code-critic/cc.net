using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
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

namespace CC.Net.Controllers
{
    public partial class StudentController
    {
        private ViewResultService _viewResultService;
        public CcData ConvertToExtended(CcData item)
        {
            return _utilService.ConvertToExtended(item);
        }

        [HttpGet]
        [Route("student-result-list/{courseName}/{courseYear}/{problem}/{user}")]
        public IEnumerable<CcData> StudentResultDetail(string courseName, string courseYear, string problem, string user)
        {
            var results = _dbService.Data
                .Find(i => i.CourseName == courseName
                     && i.CourseYear == courseYear
                     && i.Problem == problem
                     && (i.User == user || i.GroupUsers.Contains(user))
                     //  && i.Action == "solve"
                     )
                .SortByDescending(i => i.Id)
                .Limit(25)
                .ToEnumerable();

            foreach (var item in results)
            {
                yield return ConvertToExtended(item);
            }
        }

        [HttpGet]
        [Route("student-result-list/{id}")]
        public CcData ResultDetail(string id)
        {
            var objectId = new ObjectId(id);
            var result = _dbService.Data
                .Find(i => i.Id == objectId)
                .First();

            return ConvertToExtended(result);
        }

        [HttpPost]
        [Route("student-result-list")]
        [RequireRole(AppUserRoles.Root)]
        public async Task<TableResponse> Post([FromBody] TableRequest request)
        {
            return await _viewResultService.GetResultsAsync(request);
        }
    }
}
