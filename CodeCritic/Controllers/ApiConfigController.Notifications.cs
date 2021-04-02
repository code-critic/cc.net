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
        public const string ResultGetUrl = "result-get"; 
        public const string FileGetUrl = "file-get"; 
    
        [HttpGet(ResultGetUrl + "/{objectId}")]
        public async Task<IActionResult> ResultGet(string objectId)
        {
            var user = _userService.CurrentUser.Id;
            await _utilService.MarkNotificationAsReadAsync(new ObjectId(objectId), user);

            var id = new ObjectId(objectId);
            var item = await _dbService.DataSingleAsync(id);
            var result = new ApiResponse<CcData>(_utilService.IncludeDirectories(item));
            return Ok(result);
        }
        
        [HttpGet(FileGetUrl + "/{objectId}/{*path}")]
        public async Task<IActionResult> FileGet(string objectId, string path)
        {
            var id = new ObjectId(objectId);
            var item = await _dbService.DataSingleAsync(id);
            var result = _utilService.GetFileContent(item, path);
            return Ok(result);
        }
    }
}