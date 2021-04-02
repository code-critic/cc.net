using System;
using System.Linq;
using System.Threading.Tasks;
using Cc.Net;
using Cc.Net.Apis;
using CC.Net.Collections;
using cc.net.Utils;
using CC.Net.Services.Courses;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CC.Net.Controllers
{
    public partial class ApiConfigController
    {
        public const string NotificationsGetUrl = "notificatons-get"; 
    
        
        [HttpGet(NotificationsGetUrl)]
        public async Task<IActionResult> NotificationsGet(string objectId, string path)
        {
            var user = _userService.CurrentUser;
            var minDate = DateTime.Now.Subtract(TimeSpan.FromDays(30));
            var minId = new ObjectId(minDate, 0, 0, 0);
            var notifications = await _dbService.Events
                .Find(i => i.Id > minId && i.Reciever == user.Id)
                .SortByDescending(i => i.IsNew)
                .SortByDescending(i => i.Id)
                .Limit(30)
                .ToListAsync();
            
            var result = new ApiListResponse<CcEvent>(notifications);

            return Ok(result);
        }
    }
}