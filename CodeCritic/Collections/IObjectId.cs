using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CC.Net.Collections
{
    public interface IObjectId
    {
        ObjectId Id { get; set; }
    }
}
