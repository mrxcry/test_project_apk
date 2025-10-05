import 'package:flutter/material.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> users = [];
  final api = ApiService();

  @override
  void initState() {
    super.initState();
    loadUsers();
  }

  void loadUsers() async {
    final data = await api.getUsers();
    setState(() {
      users = data;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Users")),
      body: ListView.builder(
        itemCount: users.length,
        itemBuilder: (context, index) {
          return ListTile(title: Text(users[index]['username']));
        },
      ),
    );
  }
}
