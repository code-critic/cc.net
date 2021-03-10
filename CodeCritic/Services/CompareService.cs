using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Dto;
using CC.Net.Extensions;
using CC.Net.Services.Courses;
using CC.Net.Utils;
using DiffPlex;
using DiffPlex.DiffBuilder;

namespace CC.Net.Services
{
    public class CompareService
    {

        public DiffResult CompareFiles(string generatedFile, string referenceFile)
        {
            var generated = File.ReadAllText(generatedFile).TrimEnd();
            var reference = File.ReadAllText(referenceFile).TrimEnd();

            var diffBuilder = new InlineDiffBuilder(new Differ());
            var diff = diffBuilder.BuildDiffModel(generated, reference, true);

            return new DiffResult
            {
                Generated = generatedFile,
                Reference = referenceFile,
                Lines = diff.Lines
            };
        }

        public DiffResult CompareFiles(CourseContext Context, CourseProblemCase @case)
        {
            var generatedFile = Context.TmpDir.OutputFile(@case.Id);
            var referenceFile = Context.ProblemDir.OutputFile(@case.Id);
            return CompareFiles(generatedFile, referenceFile);
        }

        public DiffResultComposite CompareFilesComposite(CourseContext Context, CourseProblemCase @case)
        {
            var generatedFile = Context.TmpDir.OutputFile(@case.Id);
            var referenceFile = Context.ProblemDir.OutputFile(@case.Id);
            return CompareFilesComposite(generatedFile, referenceFile);
        }
        public DiffResultComposite CompareFilesComposite(string generatedFile, string referenceFile)
        {
            if(!File.Exists(referenceFile))
            {
                return new DiffResultComposite
                {
                    Error = $"Reference file not found: {referenceFile}"
                };
            }

            var generatedLines = generatedFile.ReadLines();
            var referenceLines = referenceFile.ReadLines();
            var lines = referenceLines.Zip(generatedLines);

            var lineId = 0;
            var result = new DiffResultComposite(){
                Reference = referenceFile,
                Generated = generatedFile,
                Lines = new List<DiffResultLine>()
            };

            foreach (var line in lines)
            {
                result.Lines.Add(new DiffResultLine{
                    Reference = line.First,
                    Generated = line.Second,
                    Type = line.First == line.Second
                        ? DiffResultLineType.Correct
                        : DiffResultLineType.Wrong
                });
                lineId++;
            }

            var generatedRemainder = generatedLines
                .Skip(lineId)
                .ToList();
            
            if(generatedRemainder.All(i => string.IsNullOrWhiteSpace(i)))
            {
                generatedRemainder = new List<string>();
            }

            var referenceRemainder = referenceLines
                .Skip(lineId)
                .ToList();

            if (referenceRemainder.All(i => string.IsNullOrWhiteSpace(i)))
            {
                referenceRemainder = new List<string>();
            }

            foreach (var line in referenceRemainder)
            {
                result.Lines.Add(new DiffResultLine
                {
                    Reference = line,
                    Generated = "",
                    Type = DiffResultLineType.Wrong
                });
            }

            foreach (var line in generatedRemainder)
            {
                result.Lines.Add(new DiffResultLine
                {
                    Reference = line,
                    Generated = "",
                    Type = DiffResultLineType.Wrong
                });
            }


            return result;
        }
    }
}