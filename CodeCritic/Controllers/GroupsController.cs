﻿using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cc.Net.Extensions;
using CC.Net.Collections;
using CC.Net.Db;
using CC.Net.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CC.Net.Controllers
{

    [ApiController]
    [Route("api")]
    [Authorize]
    public class GroupsController: ControllerBase
    {

        private readonly UserService _userService;
        private readonly IDbService _dbService;
        public GroupsController(UserService userService, IDbService dbService)
        {
            _userService = userService;
            _dbService = dbService;
        }

        private CcGroup CheckGroup(CcGroup request)
        {
            var student = _userService.CurrentUser.Id;
            var newGroup = new CcGroup
            {
                Id = request.Id == ObjectId.Empty ? ObjectId.GenerateNewId() : request.Id,
                Name = request.Name,
                Owner = student,
                Status = CcUserGroupStatus.NotConfirmed,
                Users = request.Users
                    .Where(i => !string.IsNullOrWhiteSpace(i.Name))
                    .Concat(new CcUserGroup[] { new CcUserGroup { Name = student, Status = CcUserGroupStatus.Confirmed } } )
                    .GroupBy(i => i.Name)
                    .Select(i => i.First())
                    .ToList()
            };

            return newGroup;
        }

        [HttpPost]
        [Route("student/group-new")]
        public async Task<object> CreateGroup([FromBody] CcGroup request)
        {
            request.Owner = _userService.CurrentUser.Id;
            var sameNameCount = await _dbService.Groups
                .CountDocumentsAsync(i => i.Name == request.Name && i.Owner == request.Owner);

            if (sameNameCount > 0)
            {
                return new { code = 403, message = "Groups with this name already exists" };
            }

            var newGroup = CheckGroup(request);
            _dbService.Groups.Add(newGroup);

            return new { code = 200 };
        }
        
        [HttpPost]
        [Route("student/group-status")]
        public async Task<object> CreateGroup([FromBody] CcUserGroupUpdate request)
        {
            var student = _userService.CurrentUser.Id;
            var id = ObjectId.Parse(request.Oid);
            var group = await _dbService.Groups.SingleOrDefaultAsync(id);

            if (group == null)
            {
                return new { code = 400 };
            }

            if (request.Name != student)
            {
                return new { code = 500 };
            }

            group.Users.ForEach(i =>
            {
                if (i.Name == student)
                {
                    i.Status = request.Status;
                }
            });

            await _dbService.Groups.UpdateDocumentAsync(group);


            return new { code = 200 };
        }
        
        [HttpPost]
        [Route("student/group-edit")]
        public async Task<object> EditGroup([FromBody] CcGroup request)
        {
            var student = _userService.CurrentUser.Id;
            var id = ObjectId.Parse(request.Oid);
            var group = await _dbService.Groups.SingleOrDefaultAsync(id);

            if (group == null)
            {
                return new { code = 400 };
            }

            if (group.Owner != student)
            {
                return new { code = 500 };
            }

            request.Id = id;
            var newGroup = CheckGroup(request);
            await _dbService.Groups.UpdateDocumentAsync(newGroup);

            return new { code = 200 };
        }

        [HttpGet]
        [Route("student/group")]
        public async Task<List<CcGroup>> ListGroups()
        {
            var student = _userService.CurrentUser.Id;
            var groups =  (await _dbService.Groups
                .FindAsync(i => i.Users.Any(j => j.Name == student)))
                .ToList();

            await groups.ForEachAsync(async i => {
                var count = await _dbService.Data.CountDocumentsAsync(j => j.GroupId == i.Id);
                i.IsLocked = count > 0;
            });
            return groups;
        }

        [HttpGet]
        [Route("student/group-delete/{objectId}")]
        public async Task<object> DeleteGroup(string objectId)
        {
            var student = _userService.CurrentUser.Id;
            var id = ObjectId.Parse(objectId);
            var group = await _dbService.Groups.SingleOrDefaultAsync(id);
            if (group == null)
            {
                return new { code = 400 };
            }

            if (group.Owner != student)
            {
                return new { code = 500 };
            }
            await _dbService.Groups.FindOneAndDeleteAsync(i => i.Id == id);
            return new { code = 200 };
        }
    }
}
