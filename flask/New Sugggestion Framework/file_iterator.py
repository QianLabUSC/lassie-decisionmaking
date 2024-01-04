
import os
import json

# assign directory
directory = './data'
file_names = []
conclusion_free_response = []
# iterate over files in a directory
for filename in os.scandir(directory):
    if filename.is_file():
        file_name = os.path.basename(filename.path)
        file_names.append(file_name.replace(".json", ""))
        with open(filename, 'r') as json_file:
            data = json.load(json_file)
            conclusion_free_response.append(data["conclusionFreeResponse"])
        
mydict = dict(zip(file_names, conclusion_free_response))

fields = ["name", "suggestion"]

# import csv 

# with open("suggestion.csv", 'w') as csvfile:
#     csv_writer = csv.DictWriter(csvfile, fieldnames = fields)
#     csv_writer.writeheader()
#     csv_writer.writerows(mydict)