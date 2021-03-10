

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
        public string CollectionLogs { get; set; } = "logs-2020";
        public string CollectionData { get; set; } = "data-2020";
        public string CollectionEvents { get; set; } = "events-2020";
        public string CollectionGroups { get; set; } = "groups-2020";
    }
}

/*
"CollectionLogs": "logs-2020",
"CollectionData": "data-2020",
"CollectionEvents": "events-2020"
"CollectionGroups": "groups-2020"
*/
