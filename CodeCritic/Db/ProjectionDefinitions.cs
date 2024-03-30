using CC.Net.Collections;
using Cc.Net.Dto;
using MongoDB.Driver;

namespace CC.Net.Db
{
    public static class ProjectionDefinitions
    {
        public static readonly ProjectionDefinition<CcData, CcDataLight> CcData2CcDataLight =
            Builders<CcData>.Projection.Expression(p => new CcDataLight
            {
                Id = p.Id,
                ObjectId = p.Id.ToString(),
                Status = p.Result.Status,
                Attempt = p.Attempt,
                ReviewRequest = p.ReviewRequest,
                Points = p.Points,
                User = p.User,
                GroupUsers = p.GroupUsers,
            });
        
        public static CcDataLight SingleCcData2CcDataLight(CcData p)
        {
            return new CcDataLight
            {
                Id = p.Id,
                ObjectId = p.Id.ToString(),
                Status = p.Result.Status,
                Attempt = p.Attempt,
                ReviewRequest = p.ReviewRequest,
                Points = p.Points,
                User = p.User,
                GroupUsers = p.GroupUsers,
            };
        }
    }
}