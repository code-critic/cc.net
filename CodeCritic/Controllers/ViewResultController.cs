using System.Collections.Generic;
using System.Threading.Tasks;
using Cc.Net.Apis;
using CC.Net.Attributes;
using CC.Net.Collections;
using Cc.Net.Services;
using CC.Net.Services;
using CC.Net.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Cc.Net.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class ViewResultController: ControllerBase
    {

        private readonly ViewResultService _viewResultService;

        public ViewResultController(ViewResultService viewResultService)
        {
            _viewResultService = viewResultService;
        }

        [HttpPost]
        [Route("view-results")]
        [RequireRole(AppUserRoles.Root)]
        [ProducesResponseType(typeof(ApiResponse<TableResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ViewResults([FromBody] TableRequest request)
        {
            var items = await _viewResultService.GetResultsAsync(request);
            return Ok(new ApiResponse<TableResponse>(items));
        }
    }
}