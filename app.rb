#!/usr/bin/env ruby

require 'sinatra'
require 'sinatra/partial'
require './input_data.rb'

class App < Sinatra::Application
  get '/' do
    erb :index
  end
end

