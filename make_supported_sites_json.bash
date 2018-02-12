python -c 'import os, json; print json.dumps([f.replace(".css", "") for f in os.listdir("./styles")])' > supportedsites.json
