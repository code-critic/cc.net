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

        private string _matlabResetTemplate = @"
clear variables; close all; format; digits(32); clc;
exit = @() fprintf(""cannot use exit in terminal mode"");
fprintf(""matlab-server-command-mode:ready-{guid}\n"");
";
        private async Task<ProcessResult> ProcessCaseMatlabAsync(CourseProblemCase @case, string filename)
        {
            var uid = Guid.NewGuid().ToString();
            var content = _matlabResetTemplate.Replace("{guid}", uid);
            var resetFilename = "resetworkspace.m";
            await File.WriteAllTextAsync(Context.TmpDir.RootFile(resetFilename), content);
            CopyToDocker(resetFilename);
            SetPermissions();
            
            return await _matlabServer.RunFileAsync(filename, uid, resetFilename, Context.DockerTmpWorkdir);
        }
    }
}