using System.Threading.Tasks;
using Cc.Net.Apis;
using CC.Net.Attributes;
using Cc.Net.Services;
using CC.Net.Services;
using CC.Net.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace cc.net.Controllers
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
        public async Task<IActionResult> ViewResults([FromBody] TableRequest request)
        {
            var items = await _viewResultService.GetResultsAsync(request);
            return Ok(new ApiResponse<TableResponse>(items));
        }
    }
}