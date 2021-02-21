using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Services.Courses;
using CC.Net.Services.Languages;
using CC.Net.Utils;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static CC.Net.Collections.CcData;

namespace CC.Net.Services
{
    public class UtilService
    {
        private readonly DbService _dbService;
        private readonly UserService _userService;
        private readonly CourseService _courseService;
        private readonly LanguageService _languageService;

        public UtilService(DbService dbService, UserService userService, CourseService courseService, LanguageService languageService)
        {
            _dbService = dbService;
            _userService = userService;
            _courseService = courseService;
        }

        public CcData ConvertToExtendedSimple(CcData item) {
            var course = _courseService[item.CourseName];
            var courseYearConfig = course[item.CourseYear];
            var problem = courseYearConfig[item.Problem];
            item.IsActive = problem.IsActive;
            return item;
        }

        public CcData ConvertToExtended(CcData item)
        {
            var course = _courseService[item.CourseName];
            var courseYearConfig = course[item.CourseYear];
            var problem = courseYearConfig[item.Problem];
            item.IsActive = problem.IsActive;

            item.Solutions = item.Solutions
                .Where(i => !i.Hidden || _userService.CurrentUser?.Role == "root")
                .OrderBy(i => i.IsMain ? 0 : int.MaxValue)
                    .ThenBy(i => i.Index)
                .ToList();

            item.Solutions.Insert(0, CcDataSolution.Seperator("Solution Files"));


            if (problem.Export.Any())
            {
                var context = new CourseContext(_courseService, _languageService, item);
                item.Solutions.Add(CcDataSolution.Seperator("Result files"));
                foreach (var f in problem.Export)
                {
                    var filepath = context.StudentDir.RootFile(f);
                    if (System.IO.File.Exists(filepath))
                    {
                        item.Solutions.Add(new CcDataSolution
                        {
                            Filename = f,
                            Content = Convert.ToBase64String(System.IO.File.ReadAllBytes(filepath))
                        });
                    }
                }
            }


            item.Solutions.Add(CcDataSolution.Seperator("Browser Directories"));

            item.Solutions.AddRange(
                new CcDataSolution[] {
                    problem.Unittest ? null : CcDataSolution.Dynamic("Input", item.ObjectId),
                    CcDataSolution.Dynamic("Output", item.ObjectId),
                    CcDataSolution.Dynamic("Error", item.ObjectId),
                    problem.Unittest ? null : CcDataSolution.Dynamic("Reference", item.ObjectId)
                }
            );

            item.Solutions = item.Solutions
                .Where(i => i != null)
                .ToList();

            return item;
        }

        public async Task<long> MarkNotificationAsReadAsync(CcEvent ccEvent)
        {
            if (ccEvent != null)
            {
                var result = await _dbService.Events.DeleteOneAsync(i => i.Id == ccEvent.Id);
                return result.DeletedCount;
            }

            return 0L;
        }

        public async Task<long> MarkNotificationAsReadAsync(ObjectId? resultId, string user)
        {
            if (resultId.HasValue)
            {
                var result = await _dbService.Events.DeleteManyAsync(i => i.Reciever == user && i.ResultId == resultId.Value);
                return result.DeletedCount;
            }

            return 0L;
        }

        public async Task<List<string>> GetUsersRelatedToResult(string objectId)
        {
            var oid = new ObjectId(objectId);
            var ccData = await _dbService.DataSingleOrDefaultAsync(oid);
            return await GetUsersRelatedToResult(ccData);
        }

        public async Task<List<string>> GetUsersRelatedToResult(CcData ccData)
        {
            var sender = _userService.CurrentUser.Id;

            var settingsConfig = _courseService[ccData.CourseName][ccData.CourseYear][ccData.Problem]
                .CourseYearConfig.SettingsConfig;

            var students = ccData.UserOrGroupUsers;

            // all teachers for given users
            var teachers = students
                .SelectMany(i => settingsConfig.TeachersFor(i))
                .Select(i => i.Id)
                .Distinct()
                .ToList();

            var recipients = new List<string>() { sender };
            recipients.AddRange(students);
            recipients.AddRange(teachers);
            recipients.AddRange(ccData?.Comments?.Select(i => i.User) ?? new List<string>());
            recipients = recipients
                .Distinct()
                .ToList();

            return recipients;
        }
    }
}
