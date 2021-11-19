using System.Collections.Generic;
using System.Linq;
using CC.Net.Services;

namespace CC.Net.Controllers
{


    public class CourseGradeStudentDto
    {
        public string User { get; set; }

        private readonly float DefaultPoints = 0;

        private IEnumerable<float> _points => Problems
            .Select(p => p.Points)
            .DefaultIfEmpty(DefaultPoints);
            
        private IEnumerable<float> _validPoints => Problems
            .Where(p => p.Points > 0)
            .Select(p => p.Points)
            .DefaultIfEmpty(DefaultPoints);


        public float TotalPoints => _points.Sum();
        public float AveragePercentage => _points.Average();
        public float AveragePercentageSolved => _validPoints.Average();

        public List<CourseGradeProblemDto> Problems { get; set; } = new List<CourseGradeProblemDto>();
        public List<string> Tags { get; set; } = new List<string>();
    }

    public class CourseGradeProblemDto
    {
        public string ProblemName { get; set; }
        public string ProblemId { get; set; }
        public string ObjectId { get; set; }
        public float Points { get; set; }
        public ProcessStatusCodes Status { get; set; }

    }
}