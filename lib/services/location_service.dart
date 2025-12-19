import 'package:geolocator/geolocator.dart';

class LocationService {
  static final LocationService _instance = LocationService._internal();

  factory LocationService() {
    return _instance;
  }

  LocationService._internal();

  Future<bool> requestLocationPermission() async {
    final status = await Geolocator.requestPermission();
    return status == LocationPermission.whileInUse || status == LocationPermission.always;
  }

  Future<Position?> getCurrentLocation() async {
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
        final granted = await requestLocationPermission();
        if (!granted) return null;
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
      return position;
    } catch (e) {
      return null;
    }
  }

  Future<String> getAddressFromCoordinates(double latitude, double longitude) async {
    try {
      final placemarks = await Geolocator.placemarkFromCoordinates(latitude, longitude);
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        return '${place.street}, ${place.locality}';
      }
      return '$latitude, $longitude';
    } catch (e) {
      return '$latitude, $longitude';
    }
  }
}
