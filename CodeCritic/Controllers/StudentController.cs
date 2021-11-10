using CC.Net.Db;
using Cc.Net.Services;
using CC.Net.Services;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CC.Net.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public partial class StudentController : ControllerBase
    {

        private readonly ILogger<StudentController> _logger;
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;
        private readonly UserService _userService;
        private readonly UtilService _utilService;

        public StudentController(ILogger<StudentController> logger, CourseService courseService, LanguageService languageService,
            UserService userService, UtilService utilService)
        {
            _logger = logger;
            _courseService = courseService;
            _languageService = languageService;
            _userService = userService;
            _utilService = utilService;
        }
    }
}
