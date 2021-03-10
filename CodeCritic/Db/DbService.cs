using CC.Net.Collections;
using CC.Net.Config;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace CC.Net.Db
{
    public class DbService
    {
        private readonly MongoDBConfig _dBConfig;
        private readonly MongoClient _client;
        private readonly IMongoDatabase _dB;

        public readonly IMongoCollection<CcData> Data;
        public readonly IMongoCollection<CcEvent> Events;
        public readonly IMongoCollection<CcGroup> Groups;
        public DbService(MongoDBConfig dBConfig)
        {
            _dBConfig = dBConfig;
            _client = new MongoClient(new MongoClientSettings()
            {
                Server = MongoServerAddress.Parse(_dBConfig.Host),
                Credential = string.IsNullOrEmpty(_dBConfig.AuthMechanism)
                    ? null
                    : MongoCredential.CreateCredential(
                        _dBConfig.AuthSource,
                        _dBConfig.Username,
                        _dBConfig.Password
                    )
            });
            _dB = _client.GetDatabase(_dBConfig.Database);

            Data = _dB.GetCollection<CcData>(_dBConfig.CollectionData);
            Events = _dB.GetCollection<CcEvent>(_dBConfig.CollectionEvents);
            Groups  = _dB.GetCollection<CcGroup>(_dBConfig.CollectionGroups);
        }

        public Task<CcData> DataSingleOrDefaultAsync(ObjectId objectId)
        {
            return Data.Find(i => i.Id == objectId).SingleOrDefaultAsync();
        }
    }
}