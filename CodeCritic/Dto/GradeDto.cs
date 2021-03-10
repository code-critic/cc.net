using CC.Net.Collections;
using CC.Net.Entities;
using CC.Net.Services;
using CC.Net.Services.Courses;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cc.Net.Dto
{
    public class GradeDto
    {
        public CcData Result { get; set; }
        public User User { get; set; }

        public static CcData EmptyResult(Course course, CourseYearConfig courseYear, CourseProblem problem, User user)
        {
            return new CcData
            {
                Id = ObjectId.GenerateNewId(),
                User = user.id,
                Problem = problem.Id,
                CourseName = course.Name,
                CourseYear = courseYear.Year,
                Action = "solve",
                Attempt = 0,
                Points = 0,
                GradeComment = "No solution recieved",
                Result = new CcDataResult
                {
                    Score = 0,
                    Scores = new int[] {0, 0, 0},
                    Status = (int)ProcessStatusCodes.NoSolution,
                    Duration = 0.0,
                    Message = "No result",
                },
                SubmissionStatus = SubmissionStatus.None,
            };
        }
    }
}
