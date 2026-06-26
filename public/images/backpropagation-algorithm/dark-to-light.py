from pathlib import Path


dark_dir = Path("dark")
light_dir = Path("light")

light_dir.mkdir(parents=True, exist_ok=True)

mapping = {
    "#f3f3f3": "#000000",
    "#7a9cc6" : "#06a77d",
    "#7fd1b9" : "#2d728f",
    "#d3a588" : "#bd4089",
    "#e56399" : "#d5c67a",
    "#ece2d0" : "#f1a208",
    "#b6d7a8": "#3bb273",
    "#ea9999": "#f02d3a"
}
for key in list(mapping.keys()):
    mapping[key.upper()] = mapping[key]

for svg_file in dark_dir.glob("*.svg"):
    content = svg_file.read_text(encoding="utf-8")

    for src_color, dest_color in mapping.items():
        content = content.replace(src_color, dest_color)

    (light_dir / svg_file.name).write_text(content, encoding="utf-8")

    print(f"Created: {light_dir / svg_file.name}")
