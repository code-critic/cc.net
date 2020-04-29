using System.IO;
using CC.Net.Dto;
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
            var generated = File.ReadAllText(generatedFile);
            var reference = File.ReadAllText(referenceFile);

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
            var generatedFile = Context.SolutionOutput(@case.id);
            var referenceFile = Context.ProblemOutput(@case.id);
            return CompareFiles(generatedFile, referenceFile);
        }
    }
}