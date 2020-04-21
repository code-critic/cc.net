using CC.Net.Collections;
using CC.Net.Config;
using MongoDB.Driver;
using System;

namespace CC.Net.Db
{
    public class DbService
    {
        private readonly MongoDBConfig _dBConfig;
        private readonly MongoClient _client;
        private readonly IMongoDatabase _dB;
        public readonly IMongoCollection<CcLog> Logs;
        public readonly IMongoCollection<CcData> Data;

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
            Logs = _dB.GetCollection<CcLog>(_dBConfig.CollectionLogs);
            Data = _dB.GetCollection<CcData>(_dBConfig.CollectionData);
        }
    }
}