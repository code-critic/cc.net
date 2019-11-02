

namespace CC.Net.Config
{
    public class MongoDBConfig
    {
        public string Host { get; set; }
        public string AuthSource { get; set; }
        public string AuthMechanism { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Database { get; set; }
        public string CollectionLogs { get; set; }
        public string CollectionData { get; set; }
        public string CollectionEvents { get; set; }
    }
}