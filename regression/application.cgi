#!/usr/bin/python
from wsgiref.handlers import CGIHandler
from regression import app

CGIHandler().run(app)