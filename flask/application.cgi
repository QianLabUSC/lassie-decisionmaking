#!/usr/bin/python
from wsgiref.handlers import CGIHandler
from process import app

CGIHandler().run(app)