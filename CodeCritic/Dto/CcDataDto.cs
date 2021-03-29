using System;
using System.Collections.Generic;
using System.Linq;
using CC.Net.Collections;
using CC.Net.Extensions;
using CC.Net.Services;

namespace Cc.Net.Dto
{
    public class CcDataDto
    {
        public static CcDataDto FromCcData(CcData item)
        {
            return new CcDataDto
            {
                ObjectId = item.ObjectId,
                Attempt = item.Attempt,
                Date = item.Id.CreationTime,
                IsLate = item.SubmissionStatus.ToAbbrev(),
                Users = item.UserOrGroupUsers,
                Language = item.Language,
                Course = item.CourseName,
                Year = item.CourseYear,
                Problem = item.Problem,
                ReviewRequest = item.ReviewRequest,
                Comments = item.Comments.Count,
                Score = item.Result.Scores.Select(i => i.ToString()).AsString("-"),
                Points = item.Points,
                Status = ProcessStatus.All.FirstOrDefault(i => i.Value == item.Result.Status)?.Letter,
                Group = item.GroupName,
                Duration = item.Result.Duration,
            };
        }

        public double Duration { get; set; }

        public string Group { get; set; }

        public string Status { get; set; }

        public float Points { get; set; }

        public string Score { get; set; }

        public int Comments { get; set; }

        public string IsLate { get; set; }

        public DateTime? ReviewRequest { get; set; }

        public string Problem { get; set; }

        public string Year { get; set; }

        public string Course { get; set; }

        public string Language { get; set; }

        public List<string> Users { get; set; }

        public DateTime Date { get; set; }

        public int Attempt { get; set; }

        public string ObjectId { get; set; }
    }
}