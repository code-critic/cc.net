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
using Cc.Net.Dto;
using MongoDB.Bson;
using System.Collections.Generic;

namespace CC.Net.Controllers
{
    public partial class ApiConfigController
    {
        public const string UserProblemResultsUrl = "user-problem-results"; 
        public const string UserProblemResultsLightUrl = "user-problem-results-light"; 
    

        [HttpGet(UserProblemResultsUrl + "/{courseName}/{courseYear}/{problem}/{user}")]
        public IActionResult UserProblemResults(string courseName, string courseYear, string problem, string user)
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


        private ProjectionDefinition<CcData, CcDataLight> LightProjection =
            Builders<CcData>.Projection.Expression(p => new CcDataLight
            {
                Id = p.Id,
                ObjectId = p.ObjectId,
                Status = p.Result.Status,
                Attempt = p.Attempt,
                ReviewRequest = p.ReviewRequest,
                Points = p.Points,
                User = p.User,
                GroupUsers = p.GroupUsers,
            });
        
        public class CcDataLight {

            public ObjectId Id { get; set; }
            public string ObjectId { get; set; }
            public int Status { get; set; }
            public int Attempt { get; set; }
            public DateTime? ReviewRequest { get; set; }
            public float Points { get; set; }
            public string User { get; set; }
            public List<string> GroupUsers { get; set; }
        }

        [HttpGet(UserProblemResultsLightUrl + "/{courseName}/{courseYear}/{problem}/{user}")]
        public IActionResult UserProblemResultsLight(string courseName, string courseYear, string problem, string user)
        {
            var results = _dbService.Data
                .Find(i => i.CourseName == courseName
                           && i.CourseYear == courseYear
                           && i.Problem == problem
                           && (i.User == user || i.GroupUsers.Contains(user))
                )
                .SortByDescending(i => i.Id)
                .Limit(25)
                .Project(LightProjection)
                .ToEnumerable()
                .ToList();

            var response = new ApiListResponse<CcDataLight>(results);
            return Ok(response);
        }
    }
}