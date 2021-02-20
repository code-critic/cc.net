using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson;

namespace CC.Net.Services
{
    public class IdService {
        public readonly Dictionary<ObjectId, IClientProxy> UserMap = new Dictionary<ObjectId, IClientProxy>();

        private readonly Dictionary<string, List<string>> _clients = new Dictionary<string, List<string>>();

        public void RemeberClient(IClientProxy client, ObjectId id) {
            UserMap.Add(id, client);
        }

        public IReadOnlyList<string> this[string username] 
        {
            get 
            {
                if (_clients.ContainsKey(username))
                {
                    return _clients[username].AsReadOnly() as IReadOnlyList<string>;
                }
                return new List<string>().AsReadOnly() as IReadOnlyList<string>;
            }
        }

        public IReadOnlyList<string> this[List<string> usernames]
        {
            get
            {
                var result = new List<string>();
                usernames.ForEach(username =>
                {
                    if (_clients.ContainsKey(username))
                    {
                        result.AddRange(_clients[username]);
                    }
                });

                return result.AsReadOnly();
            }
        }

        public void SaveUser(string username, string callerId)
        {
            lock(_clients)
            {
                if(!_clients.ContainsKey(username))
                {
                    _clients[username] = new List<string>();
                }

                _clients[username].Add(callerId);
            }
        }

        public void DeleteClient(string callerId)
        {
            lock (_clients)
            {
                var keys = _clients.Keys.ToList();
                foreach (var key in keys)
                {
                    _clients[key] = _clients[key]
                        .Where(i => i != callerId)
                        .ToList();
                }
            }
        }
    }
}