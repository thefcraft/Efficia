from . import db
from unittest import TestCase

class TestDbHelper(TestCase):        
    def test_baseurl(self):
        assert db.helpers.get_baseurl('https://google.com/') == 'google.com'
        assert db.helpers.get_baseurl('http://google.com/') == 'google.com'
        assert db.helpers.get_baseurl('https://dribbble.com/shots/22562281-&23-uw-Landing-Page') == 'dribbble.com'
        assert db.helpers.get_baseurl('http://subdomain.example.com/path') == 'subdomain.example.com'
        assert db.helpers.get_baseurl('https://www.example.co.uk') == 'www.example.co.uk'
        assert db.helpers.get_baseurl('example.com') == 'example.com'
        assert db.helpers.get_baseurl('127.0.0.1') == '127.0.0.1'
        assert db.helpers.get_baseurl('http://127.0.0.1:8000') == '127.0.0.1:8000'
        assert db.helpers.get_baseurl('https://example.com#section') == 'example.com'
        assert db.helpers.get_baseurl('https://example.com/path#section') == 'example.com'
        assert db.helpers.get_baseurl('http://example.com#') == 'example.com'
        assert db.helpers.get_baseurl('http://example.com/#') == 'example.com'
        assert db.helpers.get_baseurl('https://www.google.com/search?q=programmer') == 'www.google.com'
        
    def test_encode_weekdays(self):
        assert db.helpers.encode_weekdays([]) == 0b0000000
        assert db.helpers.encode_weekdays(['sunday']) == 0b0000001
        assert db.helpers.encode_weekdays(['sunday', 'monday']) == 0b0000011
        assert db.helpers.encode_weekdays(['saturday']) == 0b1000000
        assert db.helpers.encode_weekdays(['saturday', 'thursday']) == 0b1010000
        assert db.helpers.encode_weekdays(['thursday', 'friday']) == 0b0110000
        assert db.helpers.encode_weekdays(['wednesday']) == 0b0001000
        
        