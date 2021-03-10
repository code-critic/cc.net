## CourseProblem

  - `type`
     - problem type, this affects how are solutions executed and graded, default value is `linebyline`
     - type: enum [`LineByLine`, `Unittest`, `Program`, `Script`, `Application`]
  - `files`
     - string or list of string of filenames, which will be required for each solution. <br>You can specify extension (such as `files: trial_1_lib.m` or placeholder which works with every language: <br>`files: trial_1_lib.{extension}`
     - type: `string`/`string[]`
  - `id`
     - Unique identifier which **cannot be later changed**. It must be filesystem and URI safe
     - type: `string`
     - examples: 
        - `id: foo-bar`
        - `id: 01-hello-world`
  - `name`
     - Human readable name, which will be visible on cc website
     - type: `string`
     - examples: 
        - `name: 01-hello-world`
        - `name: Hello World`
  - `cat`
     - *Will be used in the future* - list of categories
     - type: `string`/`string[]`
  - `timeout`
     - Timeout in seconds (raw time, which will be scaled and translated by language used)
     - type: `float`
  - `since`
     - A datetime after which you can hand over a solution (format `YYYY-MM-DD hh:mm:ss`)
     - type: [`DateTime`](#DateTime)
  - `avail`
     - A datetime marking a soft deadline a datetime up until problem is open and accepting solutions (format `YYYY-MM-DD hh:mm:ss` or `N days` relative to `since`)
     - type: [`DateTimeOrDays`](#DateTimeOrDays)
     - examples: 
        - `avail: 2021-03-02 08:45:00`
        - `avail: 7 days`
  - `deadline`
     - A datetime marking a hard deadline after which no solution can be sent (format `YYYY-MM-DD hh:mm:ss` or `N days` relative to `since`)
     - type: [`DateTimeOrDays`](#DateTimeOrDays)
     - examples: 
        - `deadline: 2021-03-02 08:45:00`
        - `deadline: 7 days`
  - `assets`
     - string or list of strings of filenames, which will be available in a workingdirectory when solution is executed
     - type: `string`/`string[]`
  - `export`
     - string or list of strings of filenames, which will be copied out after the execution, these may be graphs, or other student generated results
     - type: `string`/`string[]`
  - `reference`
     - A field configuring reference solution used for verifying solutions an/or generating input and outputs
     - type: [`CourseReference`](#CourseReference)
  - `tests`
     - List of tests, which will be used for each solution
     - type: [`CourseProblemCase`](#CourseProblemCase)`[]`
  - `collaboration`
     - A collaboration field, which can enabled team work
     - type: [`CourseProblemCollaborationConfig`](#CourseProblemCollaborationConfig)
  - ~~`unittest`~~
     - **[OBSOLETE]** Use `type: unittest` instead
     - true/false if this problem should be treated as unittest type
     - type: `boolean`
  - ~~`libname`~~
     - **[OBSOLETE]** Use `files: <filename-here>` instead
     - A default name of the library, which will be required by cc
     - type: `string`



## CourseProblemCollaborationConfig

  - `enabled`
     - If enabled, teams can be used
     - type: `boolean`
  - `min-size`
     - Minimum size of the team, default `1`
     - type: int
  - `max-size`
     - Maximum size of the team, default `3`
     - type: int



## CourseProblemCase

  - `id`
     - Unique filesystem and URI safe identifier and also a name for the input and output file. Extension `.s` means input will not be generated and also keeps the file in the repository.
     - type: `string`
     - examples: 
        - `id: 01-COLLAB-TEST`
  - `size`
     - Size parameter, which will be passed to the reference script when generating input
     - type: int
     - examples: 
        - `id: foo`
        - `size: 123`
        - reference solution will be called with `python3 main.py -p 123`
  - `random`
     - A number of random tests which will be generated
     - type: int
  - `timeout`
     - Timeout in seconds
     - type: `float`



## CourseReference

  - `name`
     - Filename which will be used as reference solution
     - type: `string`
     - examples: 
        - `name: main.py`
        - `name: Foo.java`
  - `lang`
     - Language identifier one of [`PY-367`, `C`, `CPP`, `JAVA`, `CS`, `MATLAB`]
     - type: `string`
  - `hidden`
     - If true, reference will file will be hidden from students
     - type: `boolean`
