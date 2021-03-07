using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CC.Net.Collections;
using CC.Net.Dto.UnitTest;
using CC.Net.Extensions;
using CC.Net.Hubs;
using CC.Net.Services.Courses;
using CC.Net.Utils;
using Microsoft.Extensions.Logging;

namespace CC.Net.Services
{
    public partial class ProcessItem
    {

        private async Task ProcessCaseMatlabAsync(CourseProblemCase @case, string filename)
        {
            await _matlabServer.RunFileAsync(filename);
        }
    }
}