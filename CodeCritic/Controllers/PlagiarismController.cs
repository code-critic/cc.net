using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Attributes;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Dto;
using CC.Net.Extensions;
using CC.Net.Services;
using Cc.Net.Utils;
using DiffPlex.DiffBuilder.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Cc.Net.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class PlagiarismController : ControllerBase
    {
        private readonly IDbService _dbService;
        private readonly CompareService _compareService;

        public PlagiarismController(IDbService dbService, CompareService compareService)
        {
            _dbService = dbService;
            _compareService = compareService;
        }

        public class PlagResult
        {
            public string AId { get; set; }
            public string BId { get; set; }
            
            public string AName { get; set; }
            public string BName { get; set; }
         
            public string Language { get; set; }

            public List<SideBySideDiff> Diffs { get; set; } = new List<SideBySideDiff>();
            
            public int EqualLines { get; set; }
            public int TotalLines { get; set; }

            public double Similarity => EqualLines / Math.Max(1.0, TotalLines);

        }

        [HttpGet("plag-two/{aId}/{bId}")]
        [RequireRole(AppUserRoles.Root)]
        [ProducesResponseType(typeof(PlagResult), StatusCodes.Status200OK)]
        public async Task<PlagResult> CompareTwo(string aId, string bId)
        {
            var a = await _dbService.Data.SingleAsync(new ObjectId(aId));
            var b = await _dbService.Data.SingleAsync(new ObjectId(bId));
            var item = ComparePair(a, b, true);
            return item;
        }
        
        [HttpGet("plag-all/{courseName}/{courseYear}/{problem}")]
        [RequireRole(AppUserRoles.Root)]
        [ProducesResponseType(typeof(IEnumerable<PlagResult>), StatusCodes.Status200OK)]
        [UseCache(timeToLiveSeconds: 5 * 60)]
        public async Task<IActionResult> FindCost(string courseName, string courseYear, string problem)
        {
            var results = await _dbService.Data
                .FindAsync(i => i.CourseName == courseName
                           && i.CourseYear == courseYear
                           && i.Problem == problem
                           && i.ReviewRequest != null
                           && i.Action == "solve");

            var groups = results
                .GroupBy(i => i.Language)
                .ToList();

            var response = new List<PlagResult>();

            groups.ForEach(grp =>
            {
                var items = grp.ToList();
                
                var pairs = items
                    .SelectMany((x, i) => items.Skip(i + 1), (x, y) => (x, y))
                    .ToList();
                
                var validPairs = pairs
                    .Where(i => i.x.User != i.y.User)
                    .ToList();
                
                validPairs.ForEach(pair =>
                {
                    var (a, b) = pair;
                    var item = ComparePair(a, b);
                    response.Add(item);
                });
            });

            var subset = response
                .Where(i => i.Similarity > 0.2)
                .OrderByDescending(i => i.Similarity);
            
            return Ok(subset);
        }

        private PlagResult ComparePair(CcData a, CcData b, bool sideBySide = false)
        {
            var item = new PlagResult
            {
                Language = a.Language,
                AId = a.ObjectId,
                BId = b.ObjectId,
                AName = $"{a.User}#{a.Attempt}",
                BName = $"{b.User}#{b.Attempt}",
            };

            var aSols = a.Solutions.Where(i => i.IsMain).ToList();
            var bSols = b.Solutions.Where(i => i.IsMain).ToList();

            aSols.ForEach(aSol =>
            {
                var bSolIdx = aSol.Filename.FindMin(bSols.Select(i => i.Filename));
                var bSol = bSols[bSolIdx];
   
                var lines = EnumerableUtils.ZipLines(aSol.Content, bSol.Content);
                var equal = 0;
                lines.ForEach(zip =>
                {
                    var localCost = zip.First.DistanceTo(zip.Second, true);
                    var maxCost = Math.Max(zip.First.Length, zip.Second.Length);
                    var minCost = 1 + (int)Math.Ceiling(maxCost * 0.1);
                    var isSame = localCost <= minCost;
                
                    if (isSame)
                    {
                        equal++;
                    }
                });
                             
                item.TotalLines += lines.Count;
                item.EqualLines += equal;

                if (sideBySide)
                {
                    var diff = _compareService.CompareString(aSol.Content, bSol.Content, aSol.Filename, bSol.Filename);
                    item.Diffs.Add(diff);
                }
            });

            return item;
        }
    }
}