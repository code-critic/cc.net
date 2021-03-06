﻿using CC.Net.Collections;
using CC.Net.Utils;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CC.Net.Extensions;
using static CC.Net.Collections.CcData;
using CC.Net.Services.Courses;

namespace CC.Net.Services
{
    public partial class UtilService
    {

        public CcData IncludeDirectories(CcData item)
        {
            var course = _courseService[item.CourseName];
            var courseYearConfig = course[item.CourseYear];
            var problem = courseYearConfig[item.Problem];

            item.IsActive = problem.IsActive;
            item.Files = BrowseFiles(item, problem).ToList();

            return item;
        }

        private static IEnumerable<SimpleFile> Flatten(SimpleFile f)
        {
            var result = new List<SimpleFile> { f };
            foreach (var ff in f.Files)
            {
                result.AddRange(Flatten(ff));
            }
            return result;
        }
        public object GetFileContent(CcData item, string path)
        {
            var course = _courseService[item.CourseName];
            var courseYearConfig = course[item.CourseYear];
            var problem = courseYearConfig[item.Problem];

            var files = BrowseFiles(item, problem).SelectMany(Flatten);
            var file = files.FirstOrDefault(i => i.RelPath == path);
            if (file == null)
            {
                return null;
            }

            var info = new FileInfo(file.RawPath);
            if (!info.Exists)
            {
                return null;
            }

            var images = new[] { ".png", ".jpg", ".gif", ".jpeg" };
            var extension = $".{file.Filename.ToLower().Split('.').Last()}";
            var isImage = images.Any(i => extension == i);

            if (isImage)
            {
                var bytes = File.ReadAllBytes(info.FullName);
                return new FileContent(bytes, extension);
            }

            return new FileContent(info.FullName.ReadAllTextOrPeek(), extension);
        }

        private IEnumerable<SimpleFile> BrowseFiles(CcData item, CourseProblem problem)
        {
            var context = new CourseContext(_courseService, _languageService, item);
            var referenceRootDir = new DirectoryInfo(context.ProblemDir.Root);
            var referenceOutputDir = new DirectoryInfo(context.ProblemDir.OutputDir);
            var allowedDirs = new List<string> { "output", "input", "error", ".verification" };
            var resultDir = item.ResultDir(problem.CourseYearConfig.Course.CourseDir);
            var studentDir = new DirectoryInfo(context.StudentDir.Root);

            var files = new List<SimpleFile>();
            
            if (item.Action == "solve")
            {
                files.AddRange(problem.Export.Select(i => ToSimpleFile(new FileInfo($"{resultDir}/{i}"))));
                files.Add(new SimpleFile
                {
                    RawPath = studentDir.FullName,
                    Filename = "generated",
                    IsDir = true,
                    Files = studentDir.Exists
                            ? studentDir.GetDirectories()
                                .Where(i => allowedDirs.Contains(i.Name))
                                .Select(i => ToSimpleFile(i)).ToList()
                            : new List<SimpleFile>()
                });
                
                files.Add(ToSimpleFile(referenceOutputDir, "reference"));
                files.ForEach(i => PopulateRelPath(i));
                
                return FilterEmptyFiles(files);
            }
            else
            {
                files.Add(ToSimpleFile(referenceRootDir, "reference"));
                files.ForEach(i => PopulateRelPath(i));
                return FilterEmptyFiles(files);
            }
        }

        private static List<SimpleFile> FilterEmptyFiles(List<SimpleFile> files)
        {
            var newFiles = new List<SimpleFile>();
            foreach (var f in files)
            {
                if (f.IsDir)
                {
                    f.Files = FilterEmptyFiles(f.Files);
                    if (f.Files.Any())
                    {
                        newFiles.Add(f);
                    }
                }
                else
                {
                    var info = new FileInfo(f.RawPath);
                    if (info.Exists && info.Length > 0)
                    {
                        newFiles.Add(f);
                    }
                }
            }
            return newFiles;
        }

        private static void PopulateRelPath(SimpleFile f, string prefix = "")
        {
            f.RelPath = string.IsNullOrEmpty(prefix) ? f.Filename : $"{prefix}/{f.Filename}";
            foreach (var ff in f.Files)
            {
                PopulateRelPath(ff, f.RelPath);
            }
        }


        private SimpleFile ToSimpleFile(FileInfo info)
        {
            return new SimpleFile
            {
                RawPath = info.FullName,
                Filename = info.Name,
                IsDir = false,
            };
        }

        private SimpleFile ToSimpleFile(DirectoryInfo dir, string alias = null)
        {
            if (!dir.Exists)
            {
                return new SimpleFile
                {
                    RawPath = dir.FullName,
                    Filename = !string.IsNullOrEmpty(alias) ? alias : dir.Name,
                    IsDir = true,
                };
            }
            var root = new SimpleFile
            {
                RawPath = dir.FullName,
                Filename = !string.IsNullOrEmpty(alias) ? alias : dir.Name,
                IsDir = true,
                Files = new List<SimpleFile>()
                    .Concat(dir.GetFiles().Select(ToSimpleFile))
                    .Concat(dir.GetDirectories().Select(i => ToSimpleFile(i)))
                    .OrderBy(i => i.Filename)
                    .ToList()
            };
            return root;
        }
    }

    public class FileContent
    {
        public string Extension { get; }
        public string Content { get; }

        public FileContent(byte[] bytes, string extension)
        {
            Content = Convert.ToBase64String(bytes);
            Extension = extension;
        }

        public FileContent(string content, string extension)
        {
            Content = content;
            Extension = extension;
        }
    }
}
