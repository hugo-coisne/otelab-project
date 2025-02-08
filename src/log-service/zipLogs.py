from logzip.logzipper import Ziplog
from datetime import datetime
filepath = "log/prepared.log"
templates_filepath = "csv/event_templates.csv"  # templates file, one template per line

out_dir = "zips/"
formatted_now = datetime.now().isoformat().replace(':','-').replace('.','-')

outname = formatted_now + ".logzip"
tmp_dir = "zips/tmp"

level = 1
kernel = "gz"   # options: (1) gz  (2) bz2
n_workers = 1
def proceed():
    zipper = Ziplog(logformat="<Timestamp> <TraceId> <SpanId> <TraceFlags> <Level> <Content>",
                    outdir=out_dir,
                    outname=outname,
                    kernel=kernel,
                    tmp_dir=tmp_dir,
                    level=level)
    zipper.zip_file(filepath, templates_filepath)

if __name__ == "__main__":
    proceed()