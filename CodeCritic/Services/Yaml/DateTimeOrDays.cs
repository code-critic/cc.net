using System;
using System.Diagnostics;
using System.Text.RegularExpressions;

namespace cc.net.Services.Yaml
{
    public class DateTimeOrDays
    {
        private string _value { get; }
        private TimeSpan? _duration { get; set; }
        private DateTime? _dt { get; }
        
        private readonly Regex _durationRegex = new Regex(@".*(\d+).*");

        public DateTimeOrDays(string value)
        {
            _value = value;
            if (_value.Contains("day") && _durationRegex.IsMatch(_value))
            {
                var days = int.Parse(_durationRegex.Match(_value).Groups[1].Value);
                _duration = TimeSpan.FromDays(days);
            }
            else
            {
                _dt = DateTime.Parse(_value);
            }
        }

        public DateTime ToDateTime(DateTime baseline)
        {
            if (_dt == null && _duration == null)
            {
                throw new Exception($"Invalid datetime: {_value}");
            }
            return _dt ?? baseline.Add(_duration.Value);
        }
    }
}