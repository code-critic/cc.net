using System.Collections.Generic;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson;

namespace CC.Net.Services
{
    public class IdService {
        public readonly Dictionary<ObjectId, IClientProxy> UserMap = new Dictionary<ObjectId, IClientProxy>();

        public void RemeberClient(IClientProxy client, ObjectId id) {
            UserMap.Add(id, client);
        }
    }
}