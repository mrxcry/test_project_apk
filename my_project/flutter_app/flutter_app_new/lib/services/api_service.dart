import 'package:dio/dio.dart';

class ApiService {
  final Dio _dio = Dio(BaseOptions(baseUrl: "http://77.83.92.253:8000"));

  Future<List<dynamic>> getUsers() async {
    final response = await _dio.get("/users");
    return response.data;
  }
}
