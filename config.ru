require './app.rb'

use Rack::ShowExceptions

set :partial_template_engine, :erb
enable :partial_underscores

run App.new