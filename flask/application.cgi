#!/usr/bin/python3.6
from wsgiref.handlers import CGIHandler
from process import app

CGIHandler().run(app)