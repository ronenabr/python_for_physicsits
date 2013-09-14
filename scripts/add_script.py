#!/bin/env python

#ugly hack to add bidi script to exported html.


import sys

rep_with = """</title>
  <script type="text/javascript" src="bidiweb.js"> </script>
        <script type="text/javascript">
        document.addEventListener("DOMContentLoaded", function() {
            bidiweb.process_css('.rendered_html *', {rtl: 'rtl', ltr: 'ltr'});
        });
        </script>
<style type="text/css">
        .ltr {
            text-align: left;
            direction: ltr;

        }
        .rtl {
            text-align: right;
            direction: rtl;
        }
</style>
"""

for f in sys.argv:
	if not f.endswith(".html"):
		continue
	con = open(f,"r").read()
	con = con.replace("</title>",rep_with)
	f = open(f,"w")
	f.write(con)
	f.close()


