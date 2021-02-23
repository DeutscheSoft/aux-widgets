#!/usr/bin/env python3

"""
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
"""


from xml.dom import minidom
import os
import sys
import argparse
import subprocess

def parseGlyphs (font):
  
  length = []
  for glyph in font.getElementsByTagName("glyph"):
    icon = glyph.getAttribute("glyph-name")
    icon = icon.replace(" ", "").lower()
    length.append(len(icon))
  size = max(length)
  
  glyphs = []
  
  for glyph in font.getElementsByTagName("glyph"):
    name = glyph.getAttribute("glyph-name")
    atoms = name.split("/")
    g = {}
    g["name"] = name #atoms[0]
    g["char"] = glyph.getAttribute("unicode")
    g["icons"] = []
    g["fills"] = []
    if not g["name"] or not g['char']:
      continue
    for a in atoms:
      icon = a.replace(" ", "").lower()
      icon = icon.replace(".", "_")
      g["icons"].append(icon)
      g["fills"].append(" " * (size - len(icon)))
    glyphs.append(g)
    
  return glyphs



def prepareTemplate (fname, ftype, family, title, name, path, prefix, css, html, ttf):
  if not os.path.isfile(fname):
    print("%s template %s is missing." % (ftype, fname))
    sys.exit(1)
  
  with open(fname) as file:
    fin = file.read()
    
  fin = fin.replace("[prefix]", prefix)
  fin = fin.replace("[family]", family)
  fin = fin.replace("[title]", title)
  fin = fin.replace("[name]", name)
  fin = fin.replace("[path]", path)
  fin = fin.replace("[css]", css)
  fin = fin.replace("[html]", html)
  fin = fin.replace("[ttf]", ttf)
  fin += "\n"
  
  return fin



def generateCSS (fname, font, glyphs, family, title, name, path, prefix, css, html, ttf):
  css = prepareTemplate(fname, "CSS", family, title, name, path, prefix, css, html, ttf)
  
  for g in glyphs:
    for i in range(0, len(g["icons"])):
      css += ".%sicon.%s::before %s{ font-family: '%s'; content: '%s'; }\n" % (prefix, g["icons"][i], g["fills"][i], family, g["char"])
  
  with open(os.path.join(path, name + ".css"), "wb") as f:
    f.write(css.encode('utf-8')) 



def generateHTML (fname, font, glyphs, family, title, name, path, prefix, css, html, ttf):
  html = prepareTemplate(fname, "HTML", family, title, name, path, prefix, css, html, ttf)
  
  table = "\n<table>\n"
  table += "<tr><th>Icon</th><th>Char</th><th>Name</th><th>CSS</th><th>HTML</th></tr>\n"
  for g in glyphs:
    table += "<tr>"
    table += "<td><span class='%sicon %s'></span></td>" % (prefix, g['icons'][0])
    table += "<td>%s</td>" % g['char']
    table += "<td>%s</td>" % g['name']
    table += "<td>%s</td>" % "<br>".join(g['icons'])
    table += "<td>"
    for i in range(0, len(g["icons"])):
      table += "&lt;span class='%sicon %s'&gt;&lt;/span&gt;<br>" % (prefix, g['icons'][i])
    table += "</td>"
    table += "</tr>\n"
  table += "</table>\n\n"
  
  html = html.replace("[glyphs]", table);
  
  with open(os.path.join(path, name + ".html"), "wb") as f: 
    f.write(html.encode('utf-8')) 



def main (args):
  infile = args.infile
  
  if infile[-3:] == "svg":
    svg = args.infile
    name = os.path.basename(infile)[:-4]
  else:
    svg = "%s.svg" % args.infile
    name = os.path.basename(infile)
    
  path = os.path.dirname(infile)
  
  try:
    source = minidom.parse(svg)
  except:
    print("Unable to parse file %s" % svg)
    
  css = os.path.join(path, name + ".css")
  html = os.path.join(path, name + ".html")
  ttf = os.path.join(path, name + ".ttf")
  
  try:
    fonts = source.getElementsByTagName("font")
  except:
    print("No fonts found in %s" % svg)
    sys.exit(1)
  
  if args.prefix:
    prefix = args.prefix
  else:
    prefix = ""
    
  for font in fonts:
    title = font.getAttribute("id")
    family = font.getElementsByTagName("font-face")[0].getAttribute("font-family")
    glyphs = parseGlyphs(font)
    
    if args.css:
      generateCSS(os.path.join(path, "%s.css.in" % name), font, glyphs, family, title, name, path, prefix, css, html, ttf)
    
    if args.html:
      generateHTML(os.path.join(path, "%s.html.in" % name), font, glyphs, family, title, name, path, prefix, css, html, ttf)

    if args.ttf:
      exe = subprocess.call("type fontforge", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE) == 0
      if not exe:
        print("FontForge not installed")
        sys.exit(1)
      
      #cmd = "fontforge -c 'Open(\"%s\");Generate(\"%s\");Quit(0);'" % (svg, ttf)
      cmd = "fontforge  -lang=ff -c 'Open(\"%s\");Generate(\"%s\");Quit(0);'" % (svg, ttf)
      print("%s" % cmd)
      s = os.system(cmd)
      if s:
        print("Converting %s to %s failed" % (svg, ttf))

if __name__ == "__main__":
  parser = argparse.ArgumentParser(add_help=False)
  parser.add_argument('-c', '--css', action='store_false')
  parser.add_argument('-t', '--ttf', action='store_false')
  parser.add_argument('-h', '--html', action='store_false')
  parser.add_argument('-p', '--prefix')
  parser.add_argument('infile')
  args = parser.parse_args()
  main(args)
