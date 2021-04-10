using CC.Net.Services.Languages;

namespace Cc.Net.Extensions
{
    public static class DoubleExtensions
    {
        public static double ScaleTo(this double value, Language language)
        {
            return language.ScaleStart + value * language.ScaleFactor;
        }
    }
}