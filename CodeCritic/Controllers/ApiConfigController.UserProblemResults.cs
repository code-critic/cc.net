using System;
using System.Linq;
using System.Threading.Tasks;
using Cc.Net;
using Cc.Net.Apis;
using CC.Net.Collections;
using CC.Net.Services;
using cc.net.Utils;
using CC.Net.Services.Courses;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace CC.Net.Controllers
{
    public partial class ApiConfigController
    {
        public const string UserProblemResults = "user-problem-results"; 
    

        [HttpGet(UserProblemResults + "/{courseName}/{courseYear}/{problem}/{user}")]
        [UseCache(timeToLiveSeconds: 30, perUser: true)]
        public IActionResult UserProblemResultsList(string courseName, string courseYear, string problem, string user)
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
                .ToEnumerable()
                .Select(_utilService.ConvertToExtended)
                .ToList();

            // var rng = new Random();
            // var options = (ProcessStatusCodes[]) Enum.GetValues(typeof(ProcessStatusCodes));
            // results.ForEach(i => i.Result.Status = (int) options[rng.Next(0, options.Length-1)]);

            var response = new ApiListResponse<CcData>(results);
            return Ok(response);
        }
    }
}