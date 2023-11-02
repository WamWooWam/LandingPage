﻿using System;
using System.Collections;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Serialization;

int indent = 0;
StreamWriter? writer = null;

var styles = new Dictionary<string, Style>();
var usedStyles = new HashSet<string>();
var file = args.Length > 0 ? args[0] : @"C:\Users\Thomas\Desktop\win8\twinui\.rsrc\TILETEMPLATE\";
if (new DirectoryInfo(file).Exists)
{
    var list = new List<string>();
    foreach (var duixml in new DirectoryInfo(file).GetFiles("*.duixml"))
    {
        Console.WriteLine($"Processing {duixml.Name}");
        var name = ProcessFile(duixml.FullName);
        list.Add(name);
    }

    writer = File.CreateText("TileTemplates/index.scss");
    WriteAutoGeneratedHeader();
    foreach (var style in usedStyles)
    {
        WriteOpen($".{MakeCssName(styles[style].ResId)} {{");

        foreach (var property in GetCssPropertiesForStyle(styles[style]))
        {
            Write($"{property.key}: {property.value};");
        }

        WriteClose();
    }

    writer.Close();

    writer = File.CreateText("TileTemplates/index.ts");
    WriteAutoGeneratedHeader();

    Write($"import './index.scss'");

    foreach (var name in list)
    {
        Write($"import {name} from './{name}'");
    }

    Write("");
    Write("const TileTemplates = {");
    foreach (var name in list)
    {
        Write($"    {name},");
    }
    Write("};");

    Write("export default TileTemplates;");
    writer.Close();
}
else
{
    ProcessFile(file);
}


string ProcessFile(string file)
{
    var document = new XmlDocument();
    document.Load(file);

    var root = document.DocumentElement!;
    var stylesheets = root.GetElementsByTagName("style");

    foreach (XmlElement stylesheet in stylesheets)
    {
        var id = stylesheet.GetAttribute("resid");
        var child = stylesheet.FirstChild!;
        var type = child.Name;
        var properties = new Dictionary<string, string>();
        foreach (XmlAttribute attribute in child.Attributes!)
        {
            properties.Add(attribute.Name, attribute.Value);
        }

        if (styles.TryGetValue(id, out var existing))
        {
            // check if the existing style is the same
            if (existing.Type != type || existing.Properties.Count != properties.Count)
            {
                throw new Exception($"Style {id} already exists with different type or properties");
            }
        }
        else
        {
            styles.Add(id, new Style(id, type, properties));
        }
    }

    var element = (root.SelectSingleNode("/duixml/NotificationElement") as XmlElement)!;
    var rootId = element.GetAttribute("resid")!;

    writer = File.CreateText("TileTemplates/" + MakeCssName(rootId) + ".scss");
    indent = 0;

    WriteAutoGeneratedHeader();
    //foreach (XmlElement containers in element.ChildNodes)
    //{
    //    var id = containers.GetAttribute("id")[5..^1];
    //    ProcessElementStyles(containers, usedStyles);
    //}

    ProcessElementStyles(element, usedStyles);

    writer.Close();

    writer = File.CreateText("TileTemplates/" + rootId + ".tsx");
    WriteAutoGeneratedHeader();

    Write($"import \"./{MakeCssName(rootId)}.scss\"");
    Write("import TileTemplateProps from '../TileTemplateProps'");
    Write("import TileNotificationBinding from '../TileNotificationBinding'");
    Write("import TileImageBinding from '../TileImageBinding'");
    Write("import TileTextBinding from '../TileTextBinding'");

    Write("");

    WriteOpen($"export default function {rootId}(props: TileTemplateProps) {{");

    foreach (XmlElement containers in element.ChildNodes)
    {
        ProcessElementBindings(containers, containers.GetAttribute("id")[5..^1], "");
    }

    Write("");
    WriteOpen($"return (");
    ProcessElement(element, rootId, "");
    WriteClose(");");
    WriteClose();

    writer.Close();

    return rootId;

    void ProcessElementBindings(XmlElement element, string parentType, string type)
    {
        var sheet = element.GetAttribute("sheet");
        var style = new Style("", "", []);
        if (!string.IsNullOrEmpty(sheet))
        {
            style = styles[sheet];
        }

        var id = 0;
        var name = element.GetAttribute("id")[5..^1];
        if (!name.All(char.IsNumber))
        {
            foreach (XmlElement child in element.ChildNodes)
            {
                ProcessElementBindings(child, type, name);
            }

            return;
        }

        id = int.Parse(name);

        var htmlElement = type == "Images" ? "TileImageBinding" : GetHTMLElement(element.Name);

        if (element.ChildNodes.Count != 0)
        {
            throw new Exception("shouldn't ever happen?");
        }
        else
        {
            var jsType = type == "Images" ? "image" : "text";
            Write($"const {jsType}{id} = props.elements.find(b => b.id === {id} && b.type === '{jsType}');");
        }
    }

    void ProcessElement(XmlElement element, string parentType, string type)
    {
        var sheet = element.GetAttribute("sheet");
        var style = new Style("", "", []);
        if (!string.IsNullOrEmpty(sheet))
        {
            style = styles[sheet];
        }

        var id = 0;
        var name = element.GetAttribute("id");
        if (!string.IsNullOrEmpty(name))
        {
            name = name[5..^1];
            if (name?.All(char.IsNumber) == true)
            {
                id = int.Parse(name);
                name = $"Id-{name}";
            }
        }
        else
        {
            name = parentType;
        }

        var cssName = "";
        if (!string.IsNullOrEmpty(style.ResId))
        {
            cssName += $"{MakeCssName(style.ResId)}";
        }

        cssName += $" {MakeCssName(name)}";
        cssName = cssName.Trim();

        var htmlElement = type == "Images" ? "TileImageBinding" : GetHTMLElement(element.Name);

        var props = new List<ReactProperty> { new ReactProperty("className", cssName, false) };
        props.AddRange(GetJSProperties(element));

        if (id != 0)
        {
            props.Add(new ReactProperty("binding", $"{(type == "Images" ? "image" : "text")}{id}", true));
        }

        var Props = string.Join(" ", props.Select(p => p.IsProp ? $"{p.Name}={{{p.Value}}}" : $"{p.Name}=\"{p.Value}\""));

        if (element.ChildNodes.Count != 0)
        {
            WriteOpen($"<{htmlElement} {Props}>");
            foreach (var child in element.ChildNodes)
            {
                if (child is XmlText text)
                {
                    Write(text.Value);
                }
                else if (child is XmlElement childElement)
                {
                    ProcessElement(childElement, type, name);
                }
            }
            WriteClose($"</{htmlElement}>");
        }
        else
        {
            Write($"<{htmlElement} {Props} />");
        }
    }

    void ProcessElementStyles(XmlElement element, HashSet<string> usedStyles)
    {
        var sheet = element.GetAttribute("sheet");
        var style = new Style("", "", []);
        if (!string.IsNullOrEmpty(sheet))
        {
            usedStyles.Add(sheet);
        }

        var name = "";
        var resid = element.GetAttribute("resid");
        if (!string.IsNullOrEmpty(resid))
        {
            name = MakeCssName(resid);
        }
        else
        {
            name = element.GetAttribute("id")[5..^1];
            if (name.All(char.IsNumber))
            {
                name = $"Id-{name}";
            }
        }

        var duiElement = new DuiElement(element, style);

        var cssName = MakeCssName(name);
        WriteOpen($".{cssName} {{");

        foreach (var (key, value) in GetCssProperties(duiElement))
        {
            Write($"{key}: {value};");
        }

        ProcessElementMargins(duiElement);

        foreach (XmlElement child in element.ChildNodes)
        {
            ProcessElementStyles(child, usedStyles);
        }

        WriteClose();
    }

    void ProcessElementMargins(DuiElement element)
    {
        foreach (XmlAttribute attribute in element.Element.Attributes!)
        {
            switch (attribute.Name)
            {
                case "logomargins":
                case "badgemargins":
                case "logoandbadgemargins":
                    ProcessElementMargin(element, attribute.Name, attribute.Value);
                    break;
            }
        }
    }

    void ProcessElementMargin(DuiElement element, string type, string value)
    {
        var match = RECT.Match(value).Groups.Values.Skip(1).Select(g => int.Parse(g.Value)).ToArray();
        int left = (int)(match[0] * 0.8), top = (int)(match[1] * 0.8), right = (int)(match[2] * 0.8), bottom = (int)(match[3] * 0.8);
        var rect = new Rectangle(left, top, right - left, bottom - top);

        var cssName = type switch
        {
            "logomargins" => "&.logo",
            "badgemargins" => "&.badge",
            "logoandbadgemargins" => "&.logo.badge",
        };

        WriteOpen($"{cssName} {{");

        ProcessLayerMargins(element, "Headlines", rect);
        ProcessLayerMargins(element, "TextFields", rect);
        ProcessLayerMargins(element, "BlockTextFields", rect);

        WriteClose();
    }

    void ProcessLayerMargins(DuiElement element, string layer, Rectangle rect)
    {
        var layerElement = element.Element.SelectSingleNode($"element[@id='atom({layer})']") as XmlElement;
        if (layerElement == null) return;

        var style = new Style("", "", []);
        if (!string.IsNullOrEmpty(layerElement.GetAttribute("sheet")))
        {
            style = styles[layerElement.GetAttribute("sheet")];
        }

        WriteOpen($".{MakeCssName(layer)} {{");

        var layerDui = new DuiElement(layerElement, style);
        var layerWidth = layerDui.Width;
        var layerRect = new Rectangle(new Point(layerDui.X, layerDui.Y), new Size(layerDui.Width, layerDui.Height));
        var marginsRect = rect;
        marginsRect.Offset(-layerRect.X, -layerRect.Y);

        Write($"left: {layerRect.Left}px;");
        Write($"top: {layerRect.Top}px;");
        Write($"width: {layerRect.Width}px;");
        Write($"height: {layerRect.Height}px;");

        foreach (XmlElement child in layerElement.ChildNodes)
        {
            if (child.Name != "RichText") continue;

            var childStyle = new Style("", "", []);
            if (!string.IsNullOrEmpty(child.GetAttribute("sheet")))
            {
                childStyle = styles[child.GetAttribute("sheet")];
            }

            var name = child.GetAttribute("id")[5..^1];
            if (name.All(char.IsNumber))
            {
                name = $"Id-{name}";
            }

            var cssName = MakeCssName(name);
            WriteOpen($".{cssName} {{");

            var textDui = new DuiElement(child, childStyle);
            var textHeight = textDui.Height;

            var textRect = new Rectangle(0, 0, textDui.Width, textDui.Height);
            textRect.Offset(textDui.X, textDui.Y);

            var textIntersect = Rectangle.Intersect(textRect, marginsRect);
            if (textIntersect != Rectangle.Empty)
            {
                var lineSpacing = textDui.LineSpacing;
                if (textRect != textIntersect)
                {
                    var layerX = textRect.Bottom - textRect.Top;
                    if (textIntersect.Bottom - textIntersect.Top < layerX)
                    {
                        do
                        {
                            layerX = layerX - lineSpacing;
                        } while (textIntersect.Bottom - textIntersect.Top < layerX);
                        textIntersect = new Rectangle(textIntersect.X, textIntersect.Y, textIntersect.Width, layerX);
                    }
                }

                if ((lineSpacing <= textIntersect.Bottom - textIntersect.Top) && (lineSpacing != 0))
                {
                    //local_60.rcElement.rect.left = textIntersect.left;
                    //local_60.rcElement.rect.top = textIntersect.top;
                    //local_60.rcElement.rect.right = textIntersect.right;
                    //local_60.rcElement.rect.bottom = textIntersect.bottom;

                    Write($"left: {textIntersect.Left}px;");
                    Write($"top: {textIntersect.Top}px;");
                    Write($"width: {textIntersect.Width}px;");
                    Write($"height: {textIntersect.Height}px;");


                    //local_60.cxParentWidth = iVar2;

                    //layerX = GetSingleLineYOffset(currentElement);
                    //layerY = SetElementRect((Element*)textChild, &local_60);
                    //if (-1 < layerY)
                    //{
                    //    if ((layerX != 0) &&
                    //       (uVar1 = DirectUI::RichText::GetLineCount(textChild), uVar1 == 1))
                    //    {
                    //        layerY = DirectUI::Element::GetY((Element*)textChild);
                    //        layerY = DirectUI::Element::SetY((Element*)textChild, layerY + layerX);
                    //    }
                    //    if (-1 < layerY)
                    //    {
                    //        layerY = DirectUI::Element::SetDirection((Element*)textChild, layerSize.cy);
                    //    }
                    //}
                }
                else
                {
                    Write("display: none;");
                }
            }
            else
            {
                throw new Exception("textIntersect == Rectangle.Empty");
            }

            WriteClose();
        }


        WriteClose();
    }
}



IEnumerable<ReactProperty> GetJSProperties(XmlElement element)
{
    foreach (XmlAttribute attribute in element.Attributes!)
    {
        switch (attribute.Name)
        {
            // handled by CSS
            case "width":
            case "height":
            case "x":
            case "y":
                if (element.Name == "NotificationElement")
                    yield return new(attribute.Name, ((int)(int.Parse(attribute.Value[0..^2]) * 0.8)).ToString(), true);
                break;
            case "layoutpos":
            case "font":
            case "linespacing":
            case "alpha":
            case "contentalign":
            case "typography":
            case "id":
            case "sheet":
            case "visible":
            case "resid":
            case "layout":
            case "background":
            case "imagebounds":
            case "peekmargin":
            case "logomargins":
            case "badgemargins":
            case "logoandbadgemargins":
                break;

            // not yet handled, not sure what it does?
            case "constrainlayout":
            case "overhangoffset":
                break;


            case "forcebadgeplate":
            case "dynamicformat":
                yield return new(TransformDuiNameToJS(attribute.Name), attribute.Value.ToLowerInvariant() == "on" ? "true" : "false", true);
                break;

            case "singlelineyoffset":
                yield return new(TransformDuiNameToJS(attribute.Name), ConvertRPtoPx(attribute.Value), false);
                break;

            case "class":
                if (attribute.Value == "BottomUpText")
                    yield return new("isBottomUp", "true", true);
                break;
            default:
                yield return new(TransformDuiNameToJS(attribute.Name), attribute.Value, true);
                break;
        }
    }
}

string TransformDuiNameToJS(string attributeName)
{
    return attributeName.ToLowerInvariant() switch
    {
        "dynamicformat" => "dynamicFormat",
        "forcebadgeplate" => "forceBadgePlate",
        "singlelineyoffset" => "singleLineYOffset",
        "logomargins" => "logoMargins",
        "badgemargins" => "badgeMargins",
        "logoandbadgemargins" => "logoAndBadgeMargins",
        "secondaryimageid" => "secondaryImageId",
        "peekmargin" => "peekMargin",
        "imagebounds" => "imageBounds",

        _ => attributeName
    };
}


IEnumerable<(string key, string value)> GetCssProperties(DuiElement element)
{
    foreach (XmlAttribute attribute in element.Element.Attributes!)
    {
        foreach (var val in TransformDuiPropertyToCSS(attribute.Name, attribute.Value, element))
            yield return val;
    }
}

IEnumerable<(string key, string value)> GetCssPropertiesForStyle(Style style)
{
    foreach (var x in style.Properties)
    {
        foreach (var val in TransformDuiPropertyToCSS(x.Key, x.Value))
            yield return val;
    }
}

IEnumerable<(string key, string value)> TransformDuiPropertyToCSS(string name, string value, DuiElement? element = null)
{
    switch (name)
    {
        case "width":
        case "height":
            yield return (name, ConvertRPtoPx(value)); break;
        case "x":
            yield return ("left", ConvertRPtoPx(value)); break;
        case "y":
            yield return ("top", ConvertRPtoPx(value)); break;
        case "layoutpos":
            yield return ("position", value switch
            {
                "absolute" => "absolute",
                _ => "relative"
            });
            break;
        case "font":
            {
                var font = value.Split(';');
                if (!string.IsNullOrEmpty(font[0]))
                    yield return ("font-size", $"{Math.Round(int.Parse(font[0]) * 0.8)}pt");

                break;
            }
        case "linespacing":
            yield return ("line-height", ConvertRPtoPx(value)); break;

        case "alpha":
            yield return ("opacity", $"{int.Parse(value) / 255.0}"); ;
            yield return ("background-color", "black");
            break;

        case "contentalign":
            {
                var splits = value.Split('|').Select(s => s.Trim()).ToArray();
                foreach (var split in splits)
                {
                    switch (split)
                    {
                        case "topright":
                            yield return ("text-align", "right"); break;
                        case "bottomleft":
                            yield return ("text-align", "left"); break;
                    }
                }
                break;
            }

        case "typography":
            {
                var splits = value.Split(',');
                yield return ("font-feature-settings", string.Join(',', splits.Select(s => $"'{s.Split('=')[0]}' {s.Split('=')[1]}")));
                break;
            }

        case "id":
        case "sheet":
        case "visible":
            break;

        default:
            Console.WriteLine($"Unknown property: {name}"); break;

    }
}

void ApplyMarginConstraintsToTextLayer(XmlElement element)
{

}

string GetHTMLElement(string element)
{
    switch (element)
    {
        case "RichText":
            return "TileTextBinding";
        case "NotificationElement":
            return "TileNotificationBinding";
        case "element":
        default:
            return "div";
    }
}

string ConvertRPtoPx(string rpValue)
{
    // convert 310rp to 248px
    if (int.TryParse(rpValue, out _)) return rpValue;

    var rp = int.Parse(rpValue[..^2]);
    var px = (int)(rp * 0.8);
    return $"{px}px";
}
string MakeCssName(string name)
{
    return CSS.Replace(name, "-$1").ToLower().Trim('-');
}

void Write(string line)
{
    writer?.WriteLine($"{new string(' ', indent * 4)}{line}");
}

void WriteOpen(string line)
{
    Write(line);
    indent++;
}

void WriteClose(string line = "}")
{
    indent--;

    Write(line);
}

void WriteAutoGeneratedHeader()
{
    Write($"//------------------------------------------------------------------------------");
    Write($"// <auto-generated>");
    Write($"//     This code was generated by a tool.");
    Write($"//     Runtime Version:{RuntimeEnvironment.GetSystemVersion()}");
    Write($"//");
    Write($"//     Changes to this file may cause incorrect behavior and will be lost if");
    Write($"//     the code is regenerated.");
    Write($"// </auto-generated>");
    Write($"//------------------------------------------------------------------------------");
    Write($"");
}

record class DuiElement(XmlElement Element, Style? Style)
{
    public int Width => GetRpProp("width");
    public int Height => GetRpProp("height");
    public int X => GetRpProp("x");
    public int Y => GetRpProp("y");

    public int LineSpacing => GetRpProp("linespacing");

    private int GetRpProp(string name)
    {
        var attribute = Element.GetAttribute(name);
        if (string.IsNullOrEmpty(attribute))
        {
            attribute = Style?.Properties[name];
        }

        return (int)(int.Parse(attribute[0..^2]) * 0.8);
    }
}


record class Style(string ResId, string Type, Dictionary<string, string> Properties);

record class ReactProperty(string Name, string Value, bool IsProp = false);

partial class Program
{
    [GeneratedRegex(@"rect\(([0-9]+)rp,([0-9]+)rp,([0-9]+)rp,([0-9]+)rp\)")]
    private static partial Regex _RECT();
    [GeneratedRegex("([A-Z])")]
    private static partial Regex _CSS();

    public static Regex RECT => _RECT();
    public static Regex CSS => _CSS();
}